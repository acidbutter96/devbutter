import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyTokenAndSession } from '@/services/auth';

// Import libraries dynamically / with loose typing to avoid TS type issues
// imap-simple and mailparser are used server-side only.
// @ts-ignore
import imaps from 'imap-simple';
// @ts-ignore
import { simpleParser } from 'mailparser';
import { ObjectId } from 'mongodb';
import getDb from '@/services/mongo';

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

  // reuse existing DB connection helper which caches the client/promise
  const db = await getDb();
  const submissions = db.collection('formSubmissions');
  const imapCollection = db.collection('imapMessages');

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
          // store raw imap message record with skipped status
          try {
            await imapCollection.insertOne({
              raw: raw,
              parsed: {
                from: parsed.from?.value ?? null,
                subject: subject,
                text: text,
                headers: Array.from(parsed.headers ?? []) as any,
                inReplyTo,
              },
              matchedSubmissionId: null,
              matchedReplyMessageId: null,
              appended: false,
              skipped: true,
              processedAt: new Date(),
              attributes: res.attributes ?? null,
            });
          } catch (e) {
            // don't block processing on logging failure
            console.error('Failed to insert imap message log (skipped)', e);
          }
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

        // log the raw imap message and processing decision
        let imapLogId: any = null;
        try {
          const logDoc = {
            raw: raw,
            parsed: {
              from: parsed.from?.value ?? null,
              subject: subject,
              text: text,
              headers: Array.from(parsed.headers ?? []) as any,
              inReplyTo,
            },
            matchedSubmissionId: matchedSubmission?._id ?? null,
            matchedReplyMessageId: matchedReplyMessageId ?? null,
            appended: false,
            skipped: false,
            processedAt: new Date(),
            attributes: res.attributes ?? null,
          } as any;
          const imapInsert = await imapCollection.insertOne(logDoc as any);
          imapLogId = imapInsert.insertedId;
        } catch (e) {
          console.error('Failed to insert imap message log', e);
        }

        const updateResult = await submissions.updateOne({ _id: matchedSubmission._id }, { $push: { messages: newEntry }, $set: { updatedAt: new Date() } } as any);
        if (updateResult.modifiedCount > 0) {
          result.appended += 1;
          // update imap log record to mark appended
          try {
            if (imapLogId) await imapCollection.updateOne({ _id: imapLogId }, { $set: { appended: true, appendedToSubmissionId: matchedSubmission._id } } as any);
          } catch (e) {
            console.error('Failed to update imap message log (appended)', e);
          }
          if (res.attributes && res.attributes.uid) {
            try { await connection.addFlags(res.attributes.uid, '\\Seen'); } catch (e) { /* ignore */ }
          }
        } else {
          result.errors.push(`Failed to append for submission ${String(matchedSubmission._id)}`);
          try {
            if (imapLogId) await imapCollection.updateOne({ _id: imapLogId }, { $set: { error: `Failed to append for submission ${String(matchedSubmission._id)}` } } as any);
          } catch (e) {
            console.error('Failed to update imap message log (error)', e);
          }
        }
      } catch (err: any) {
        result.errors.push(String(err?.message ?? err));
      }
    }

    return result;
  } finally {
    try { await connection.end(); } catch (e) { /* noop */ }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // allow only POST or GET (GET useful for simple curl tests)
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end('Method Not Allowed');
  }
  // Allow requests from three sources (in order of preference):
  // 1. Admin JWT + valid session (so the admin UI can call this endpoint)
  // 2. Vercel CRON secret (Authorization: Bearer <CRON_SECRET>)
  // 3. Legacy IMAP secret via x-imap-secret header
  try {
    const session = await verifyTokenAndSession(req);
    if (!session) {
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
      } else {
        // no cron secret and no imap secret configured, and not an authenticated admin
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }
    // if session exists, we allow through
  } catch (err) {
    // If verifyTokenAndSession throws (e.g. missing JWT_SECRET), fall back to secret checks
    const cronSecret = process.env.CRON_SECRET || null;
    if (cronSecret) {
      const auth = (req.headers['authorization'] as string) || '';
      if (auth !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } else if (IMAP_SECRET) {
      const header = (req.headers['x-imap-secret'] as string) || '';
      if (header !== IMAP_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } else {
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
