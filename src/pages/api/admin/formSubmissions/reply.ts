import { NextApiRequest, NextApiResponse } from "next";
import getDb from "@/services/mongo";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import { verifyTokenAndSession, unauthorized as authUnauthorized } from '@/services/auth';
import { emailTemplates, type EmailSampleData } from '@/utils/emailTemplates';

async function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0) || 1025;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // For Mailpit local testing you usually don't need auth, but nodemailer
  // accepts empty auth values.
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: user || pass ? { user: user ?? undefined, pass: pass ?? undefined } : undefined,
    tls: { rejectUnauthorized: false },
  });

  return transporter;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await verifyTokenAndSession(req);
    if (!session) return authUnauthorized(res);
  } catch (err) {
    console.error('Auth check failed', err);
    return authUnauthorized(res);
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const submissionId = req.body?.submissionId as string | undefined;
  const messageId = req.body?.messageId as string | undefined;
  const replyMessage = req.body?.replyMessage as string | undefined;
  const adminName = req.body?.adminName as string | undefined ?? process.env.ADMIN_NAME ?? 'Admin';
  const adminEmail = req.body?.adminEmail as string | undefined ?? process.env.ADMIN_EMAIL ?? 'oi@devbutter.com';

  if (!submissionId) return res.status(400).json({ error: 'submissionId is required' });
  if (!replyMessage || String(replyMessage).trim().length === 0) return res.status(400).json({ error: 'replyMessage is required' });

  try {
    const db = await getDb();
    const collection = db.collection('formSubmissions');

    let submissionDoc;
    try {
      submissionDoc = await collection.findOne({ _id: new ObjectId(submissionId) });
    } catch (e) {
      return res.status(400).json({ error: 'Invalid submissionId' });
    }

    if (!submissionDoc) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // find the original message (if messageId provided)
    let originalMessage: any = null;
    if (messageId) {
      try {
        const mid = new ObjectId(messageId);
        originalMessage = Array.isArray(submissionDoc.messages) ? submissionDoc.messages.find((m: any) => (m.messageId && String(m.messageId) === String(mid)) || (m._id && String(m._id) === String(mid))) : null;
      } catch (e) {
        originalMessage = Array.isArray(submissionDoc.messages) ? submissionDoc.messages.find((m: any) => String(m.messageId) === String(messageId) || String(m._id) === String(messageId)) : null;
      }
    }

    const replyEntry: any = {
      messageId: new ObjectId(),
      createdAt: new Date(),
      message: replyMessage,
      subject: null,
      telephone: null,
      name: adminName,
      fromAdmin: true,
      adminEmail,
      replyToMessageId: messageId ?? null,
    };

    // append reply to messages array
    const updateResult = await collection.updateOne({ _id: submissionDoc._id }, { $push: { messages: replyEntry }, $set: { updatedAt: new Date() } });

    // Build email using the user-reply template
    const template = emailTemplates.find(t => t.id === 'user-reply');
    if (!template) {
      return res.status(500).json({ error: 'Reply template missing' });
    }

    const sampleData: EmailSampleData = {
      userName: submissionDoc.name ?? submissionDoc.email ?? '',
      userEmail: submissionDoc.email ?? '',
      adminName: adminName,
      adminEmail: adminEmail,
      submittedAt: (originalMessage && originalMessage.createdAt) ? (new Date(originalMessage.createdAt)).toLocaleString() : (submissionDoc.createdAt ? new Date(submissionDoc.createdAt).toLocaleString() : new Date().toLocaleString()),
      formSource: 'Contact form',
      message: originalMessage?.message ?? '',
      replyMessage: replyMessage,
      replySentAt: new Date().toLocaleString(),
    };

    const html = template.buildHtml(sampleData);
    const subject = template.subject || 'Reply from DevButter';

    // send email
    try {
      const transporter = await createTransporter();
  const from = process.env.SMTP_FROM ?? `"${adminName}" <${adminEmail}>`;
      await transporter.sendMail({
        from,
        to: submissionDoc.email,
        subject,
        html,
        text: replyMessage,
      });
    } catch (err) {
      console.error('Failed to send reply email', err);
      // we proceed even if mail sending fails - the reply was saved in DB.
    }

    return res.status(201).json({ matchedCount: updateResult.matchedCount, modifiedCount: updateResult.modifiedCount, reply: replyEntry });
  } catch (error) {
    console.error('Error creating reply', error);
    return res.status(500).json({ error: 'Error creating reply' });
  }
}
