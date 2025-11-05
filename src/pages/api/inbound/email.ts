import { NextApiRequest, NextApiResponse } from "next";
import getDb from '@/services/mongo';
import { ObjectId } from 'mongodb';

// Minimal inbound email webhook receiver.
// Expected JSON body (provider dependent):
// { from: string, to?: string, subject?: string, text?: string, inReplyTo?: string }
// The handler will try to associate the inbound email with an existing submission
// by: 1) matching inReplyTo to a messageId or message._id inside a submission; 2) falling
// back to matching by the sender email (from) to the submission.email and attaching to
// the most recent admin reply if present.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { from, to, subject, text, inReplyTo } = req.body ?? {};

  if (!from || (!text && !subject)) {
    return res.status(400).json({ error: 'Missing required fields: from and text/subject' });
  }

  // parse from 'Name <email@domain>' or just 'email@domain'
  const fromMatch = String(from).match(/^(?:\s*"?([^"<]+)"?\s*)?<([^>\s]+)>\s*$|([^\s<>@]+@[^\s<>@]+)$/);
  let senderEmail = '';
  let senderName: string | null = null;
  if (fromMatch) {
    if (fromMatch[2]) {
      senderEmail = fromMatch[2];
      senderName = fromMatch[1] ? fromMatch[1].trim() : null;
    } else if (fromMatch[3]) {
      senderEmail = fromMatch[3];
    }
  } else {
    // fallback: try to extract an email-like substring
    const simple = String(from).match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    senderEmail = simple ? simple[1] : String(from);
  }

  try {
    const db = await getDb();
    const collection = db.collection('formSubmissions');

    let matchedSubmission: any = null;
    let matchedReplyMessageId: string | null = null;

    if (inReplyTo) {
      // try ObjectId match first
      try {
        const oid = new ObjectId(inReplyTo);
        matchedSubmission = await collection.findOne({ 'messages.messageId': oid });
        if (matchedSubmission) matchedReplyMessageId = String(oid);
      } catch (e) {
        // not a valid ObjectId — try to match by string
        matchedSubmission = await collection.findOne({ $or: [{ 'messages.messageId': String(inReplyTo) }, { 'messages._id': String(inReplyTo) }] });
        if (matchedSubmission) matchedReplyMessageId = String(inReplyTo);
      }
    }

    if (!matchedSubmission && senderEmail) {
      // fallback: find by sender email (most recent submission)
      matchedSubmission = await collection.findOne({ email: senderEmail }, { sort: { updatedAt: -1, createdAt: -1 } } as any);
    }

    if (!matchedSubmission) {
      return res.status(404).json({ error: 'No matching submission found for inbound email' });
    }

    // determine which message this reply should be attached to
    if (!matchedReplyMessageId) {
      // prefer the most recent admin reply in this submission
      const msgs = Array.isArray(matchedSubmission.messages) ? matchedSubmission.messages : [];
      const adminReplies = msgs.filter((m: any) => Boolean(m.fromAdmin));
      if (adminReplies.length > 0) {
        const latestAdmin = adminReplies.sort((a: any, b: any) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime())[0];
        // use messageId if present, otherwise fallback to _id
        matchedReplyMessageId = latestAdmin.messageId ? String(latestAdmin.messageId) : (latestAdmin._id ? String(latestAdmin._id) : null);
      }
    }

    const newEntry: any = {
      messageId: new ObjectId(),
      createdAt: new Date(),
      message: text ?? subject ?? '',
      subject: subject ?? null,
      telephone: null,
      name: senderName ?? senderEmail,
      fromAdmin: false,
      adminEmail: null,
      replyToMessageId: matchedReplyMessageId ?? null,
    };

    const updateResult = await collection.updateOne({ _id: matchedSubmission._id }, { $push: { messages: newEntry }, $set: { updatedAt: new Date() } });

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({ error: 'Failed to append inbound reply' });
    }

    return res.status(201).json({ appended: true, submissionId: String(matchedSubmission._id), reply: newEntry });
  } catch (err) {
    console.error('Inbound email handler error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
