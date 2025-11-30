import { NextApiRequest, NextApiResponse } from "next";
import getDb from "@/services/mongo";
import nodemailer from "nodemailer";
import { emailTemplates, type EmailSampleData } from '@/utils/emailTemplates';
import { ObjectId } from "mongodb";

interface FormBody {
  name?: string;
  email?: string;
  message?: string;
  subject?: string;
  telephone?: string;
  captchaToken?: string;
}

interface MessageEntry {
  messageId: ObjectId;
  createdAt: Date;
  message: string | null;
  subject: string | null;
  telephone: string | null;
  name: string | null;
  read: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body: FormBody = req.body ?? {};
  const { captchaToken, name, email, message, subject, telephone } = body;

  // minimal validation
  if (!name || !email) {
    return res.status(400).json({ error: "Missing required fields: name and email" });
  }

  const captchaValid = await verifyCaptcha(captchaToken, req);
  if (!captchaValid) {
    return res.status(400).json({ error: 'Captcha verification failed.' });
  }

  // normalize email for case-insensitive matching and storage
  const normalizedEmail = String(email).trim().toLowerCase();

  try {
    const db = await getDb();
    const collection = db.collection("formSubmissions");

  // Check if a submission with this email already exists (we store emails normalized)
  const existing = await collection.findOne({ email: normalizedEmail });

  if (existing) {
      // Build the message object for this submission
      const messageObj: MessageEntry = {
        messageId: new ObjectId(),
        createdAt: new Date(),
        message: message ?? null,
        subject: subject ?? null,
        telephone: telephone ?? null,
        name: name ?? existing.name ?? null,
        read: false,
      };

      const update: any = {
        $set: { updatedAt: new Date(), email: normalizedEmail },
        $push: { messages: { $each: [messageObj] } },
      };

      const result = await collection.updateOne({ _id: existing._id }, update);

      // send user confirmation email (fire-and-log on error)
      try {
        const info = await sendUserConfirmationEmail({
          userName: body.name ?? existing.name ?? '',
          userEmail: normalizedEmail,
          adminName: process.env.ADMIN_NAME ?? 'Admin',
          adminEmail: process.env.ADMIN_EMAIL ?? 'oi@devbutter.com',
          submittedAt: new Date().toLocaleString(),
          formSource: 'Contact form',
          message: message ?? '',
        });

        // persist send status/log into the specific message entry we just pushed
        try {
          await collection.updateOne(
            { _id: existing._id },
            {
              $set: {
                'messages.$[elem].sendStatus': 'sent',
                'messages.$[elem].sendLog': JSON.stringify(info ?? null),
                updatedAt: new Date(),
              },
            },
            { arrayFilters: [{ 'elem.messageId': messageObj.messageId }] } as any
          );
        } catch (e) {
          console.error('Failed to persist send status for updated submission', e);
        }
      } catch (err: any) {
        console.error('Failed to send user confirmation email (update):', err);
        try {
          await collection.updateOne(
            { _id: existing._id },
            { $set: { 'messages.$[elem].sendStatus': 'error', 'messages.$[elem].sendLog': String(err?.message ?? err), updatedAt: new Date() } },
            { arrayFilters: [{ 'elem.messageId': messageObj.messageId }] } as any
          );
        } catch (e) {
          console.error('Failed to persist error send status for updated submission', e);
        }
      }

      return res.status(200).json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
    }

    // No existing document - create a new one with messages as an array of objects
    const firstMessage: MessageEntry = {
      messageId: new ObjectId(),
      createdAt: new Date(),
      message: message ?? null,
      subject: subject ?? null,
      telephone: telephone ?? null,
      name: name ?? null,
      read: false,
    };

    const doc = {
      email: normalizedEmail,
      messages: [firstMessage],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    // send user confirmation email (fire-and-log on error)
    try {
      const info = await sendUserConfirmationEmail({
        userName: body.name ?? '',
        userEmail: normalizedEmail,
        adminName: process.env.ADMIN_NAME ?? 'Admin',
        adminEmail: process.env.ADMIN_EMAIL ?? 'oi@devbutter.com',
        submittedAt: new Date().toLocaleString(),
        formSource: 'Contact form',
        message: message ?? '',
      });

      try {
        await collection.updateOne(
          { _id: result.insertedId },
          { $set: { 'messages.$[elem].sendStatus': 'sent', 'messages.$[elem].sendLog': JSON.stringify(info ?? null), updatedAt: new Date() } },
          { arrayFilters: [{ 'elem.messageId': firstMessage.messageId }] } as any
        );
      } catch (e) {
        console.error('Failed to persist send status for new submission', e);
      }
    } catch (err: any) {
      console.error('Failed to send user confirmation email (insert):', err);
      try {
        await collection.updateOne(
          { _id: result.insertedId },
          { $set: { 'messages.$[elem].sendStatus': 'error', 'messages.$[elem].sendLog': String(err?.message ?? err), updatedAt: new Date() } },
          { arrayFilters: [{ 'elem.messageId': firstMessage.messageId }] } as any
        );
      } catch (e) {
        console.error('Failed to persist error send status for new submission', e);
      }
    }

    return res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error("Error saving form submission:", error);
    return res.status(500).json({ error: "Error saving form submission" });
  }
}

async function verifyCaptcha(token: string | undefined, req: NextApiRequest): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    console.error('Missing RECAPTCHA_SECRET_KEY environment variable.');
    return false;
  }

  if (!token) {
    console.warn('Captcha token missing in request body.');
    return false;
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);

    const remoteIp = getClientIp(req);
    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error('Captcha verification request failed with status', response.status);
      return false;
    }

    const result = await response.json() as { success: boolean; score?: number; ['error-codes']?: string[] };

    if (!result.success) {
      console.warn('Captcha verification failed', result['error-codes']);
      return false;
    }

    if (typeof result.score === 'number' && result.score < 0.5) {
      console.warn('Captcha verification returned low score:', result.score);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Captcha verification error:', err);
    return false;
  }
}

function getClientIp(req: NextApiRequest): string | null {
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const [first] = forwarded.split(',');
    return first?.trim() || null;
  }

  if (Array.isArray(forwarded) && forwarded.length > 0) {
    const [first] = forwarded;
    return first?.split(',')[0]?.trim() || null;
  }

  return req.socket?.remoteAddress ?? null;
}

async function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0) || 1025;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: user || pass ? { user: user ?? undefined, pass: pass ?? undefined } : undefined,
    tls: { rejectUnauthorized: false },
  });
}

async function sendUserConfirmationEmail(data: EmailSampleData) {
  const template = emailTemplates.find(t => t.id === 'user-receipt');
  if (!template) {
    throw new Error('User confirmation template (user-receipt) not found');
  }

  const html = template.buildHtml(data);
  const subject = template.subject || 'We received your message';

  const transporter = await createTransporter();

  const from = process.env.SMTP_FROM ?? `"${data.adminName}" <${data.adminEmail}>`;

  // return the nodemailer info so callers can persist send status / logs
  const info = await transporter.sendMail({
    from,
    to: data.userEmail,
    subject,
    html,
    text: data.message,
  });

  return info;
}
