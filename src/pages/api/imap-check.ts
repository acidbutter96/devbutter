import type { NextApiRequest, NextApiResponse } from 'next';

// Import libraries dynamically / with loose typing to avoid TS type issues
// imap-simple and mailparser are used server-side only.
// @ts-ignore
import imaps from 'imap-simple';
// @ts-ignore
import { simpleParser } from 'mailparser';
import { MongoClient, ObjectId } from 'mongodb';

const IMAP_HOST = process.env.IMAP_HOST;
const IMAP_PORT = Number(process.env.IMAP_PORT || 993);
const IMAP_USER = process.env.IMAP_USER;
const IMAP_PASS = process.env.IMAP_PASS;
const MAILBOX = process.env.MAILBOX || 'INBOX';
const MONGODB_URI = process.env.MONGODB_URI;
const IMAP_SECRET = process.env.IMAP_CHECK_SECRET || null; // optional shared secret

type Result = {
  processed: number;
  appended: number;
  skipped: number;
  errors: string[];
};

async function runImapCheck(): Promise<Result> {
  const result: Result = { processed: 0, appended: 0, skipped: 0, errors: [] };

  if (!IMAP_HOST || !IMAP_USER || !IMAP_PASS || !MONGODB_URI) {
    throw new Error('Missing IMAP or MONGODB env vars');
  }

  const mongo = new MongoClient(MONGODB_URI, { connectTimeoutMS: 10000 });
  await mongo.connect();
  const db = mongo.db();
  const submissions = db.collection('formSubmissions');

  const config = {
    imap: {
      user: IMAP_USER,
      password: IMAP_PASS,
      host: IMAP_HOST,
      port: IMAP_PORT,
      tls: true,
      authTimeout: 10000,
    },
    onerror: (err: any) => console.error('IMAP error', err),
  } as any;

  const connection = await imaps.connect(config);
  try {
    await connection.openBox(MAILBOX);

    const searchCriteria = ['UNSEEN'];
    const fetchOptions = { bodies: [''], markSeen: false } as any;
    const results = await connection.search(searchCriteria, fetchOptions);

    for (const res of results) {
      result.processed += 1;
      try {
        const all = res.parts.find((p: any) => p.which === '');
        const raw = all ? all.body : '';
        const parsed = await simpleParser(raw);

        const from = parsed.from?.value?.[0];
        const senderEmail = from?.address ?? String(parsed.from?.text ?? '');
        const senderName = from?.name ?? null;
        const subject = parsed.subject ?? null;
        const text = parsed.text ?? parsed.html ?? '';
        const inReplyTo = parsed.headers && parsed.headers.get ? parsed.headers.get('in-reply-to') : null;

        // try to match by inReplyTo
        let matchedSubmission: any = null;
        let matchedReplyMessageId: string | null = null;

        if (inReplyTo) {
          try {
            const oid = new ObjectId(String(inReplyTo).replace(/[<>]/g, ''));
            matchedSubmission = await submissions.findOne({ 'messages.messageId': oid });
            if (matchedSubmission) matchedReplyMessageId = String(oid);
          } catch (e) {
            matchedSubmission = await submissions.findOne({ $or: [{ 'messages.messageId': String(inReplyTo) }, { 'messages._id': String(inReplyTo) }] });
            if (matchedSubmission) matchedReplyMessageId = String(inReplyTo);
          }
        }

        if (!matchedSubmission && senderEmail) {
          matchedSubmission = await submissions.findOne({ email: senderEmail }, { sort: { updatedAt: -1, createdAt: -1 } } as any);
        }

        if (!matchedSubmission) {
          result.skipped += 1;
          // mark seen to avoid reprocessing
          if (res.attributes && res.attributes.uid) {
            try { await connection.addFlags(res.attributes.uid, '\\Seen'); } catch (e) { /* ignore */ }
          }
          continue;
        }

        if (!matchedReplyMessageId) {
          const msgs = Array.isArray(matchedSubmission.messages) ? matchedSubmission.messages : [];
          const adminReplies = msgs.filter((m: any) => Boolean(m.fromAdmin));
          if (adminReplies.length > 0) {
            adminReplies.sort((a: any, b: any) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime());
            const latestAdmin = adminReplies[0];
            matchedReplyMessageId = latestAdmin.messageId ? String(latestAdmin.messageId) : (latestAdmin._id ? String(latestAdmin._id) : null);
          }
        }

        const newEntry = {
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

  const updateResult = await submissions.updateOne({ _id: matchedSubmission._id }, { $push: { messages: newEntry }, $set: { updatedAt: new Date() } } as any);
        if (updateResult.modifiedCount > 0) {
          result.appended += 1;
          if (res.attributes && res.attributes.uid) {
            try { await connection.addFlags(res.attributes.uid, '\\Seen'); } catch (e) { /* ignore */ }
          }
        } else {
          result.errors.push(`Failed to append for submission ${String(matchedSubmission._id)}`);
        }
      } catch (err: any) {
        result.errors.push(String(err?.message ?? err));
      }
    }

    return result;
  } finally {
    try { await connection.end(); } catch (e) { /* noop */ }
    try { await mongo.close(); } catch (e) { /* noop */ }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // allow only POST or GET (GET useful for simple curl tests)
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Vercel Cron: when deployed, Vercel will include an Authorization header
  // with the secret you set in the project as CRON_SECRET. Prefer that.
  const cronSecret = process.env.CRON_SECRET || null;
  if (cronSecret) {
    const auth = (req.headers['authorization'] as string) || '';
    if (auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } else if (IMAP_SECRET) {
    // fallback to the earlier x-imap-secret header for ad-hoc calls
    const header = (req.headers['x-imap-secret'] as string) || '';
    if (header !== IMAP_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const result = await runImapCheck();
    return res.status(200).json({ ok: true, result });
  } catch (err: any) {
    console.error('imap-check error', err);
    return res.status(500).json({ ok: false, error: String(err?.message ?? err) });
  }
}
