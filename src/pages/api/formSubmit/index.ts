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

  // minimal validation
  if (!body.name || !body.email) {
    return res.status(400).json({ error: "Missing required fields: name and email" });
  }

  // normalize email for case-insensitive matching and storage
  const normalizedEmail = String(body.email).trim().toLowerCase();

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
        message: body.message ?? null,
        subject: body.subject ?? null,
        telephone: body.telephone ?? null,
        name: body.name ?? existing.name ?? null,
        read: false,
      };

      const update: any = {
        $set: { updatedAt: new Date(), email: normalizedEmail },
        $push: { messages: { $each: [messageObj] } },
      };

      const result = await collection.updateOne({ _id: existing._id }, update);

      // send user confirmation email (fire-and-log on error)
      try {
        await sendUserConfirmationEmail({
          userName: body.name ?? existing.name ?? '',
          userEmail: normalizedEmail,
          adminName: process.env.ADMIN_NAME ?? 'Admin',
          adminEmail: process.env.ADMIN_EMAIL ?? 'oi@devbutter.com',
          submittedAt: new Date().toLocaleString(),
          formSource: 'Contact form',
          message: body.message ?? '',
        });
      } catch (err) {
        console.error('Failed to send user confirmation email (update):', err);
      }

      return res.status(200).json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
    }

    // No existing document - create a new one with messages as an array of objects
    const firstMessage: MessageEntry = {
      messageId: new ObjectId(),
      createdAt: new Date(),
      message: body.message ?? null,
      subject: body.subject ?? null,
      telephone: body.telephone ?? null,
      name: body.name ?? null,
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
      await sendUserConfirmationEmail({
        userName: body.name ?? '',
        userEmail: normalizedEmail,
        adminName: process.env.ADMIN_NAME ?? 'Admin',
        adminEmail: process.env.ADMIN_EMAIL ?? 'oi@devbutter.com',
        submittedAt: new Date().toLocaleString(),
        formSource: 'Contact form',
        message: body.message ?? '',
      });
    } catch (err) {
      console.error('Failed to send user confirmation email (insert):', err);
    }

    return res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error("Error saving form submission:", error);
    return res.status(500).json({ error: "Error saving form submission" });
  }
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

  await transporter.sendMail({
    from,
    to: data.userEmail,
    subject,
    html,
    text: data.message,
  });
}
