#!/usr/bin/env node
/**
 * IMAP worker
 *
 * - Connects to an IMAP server (Hostinger credentials via env)
 * - Searches for UNSEEN messages
 * - For each message, parses 'from' and body and attempts to match a submission in
 *   `formSubmissions` collection by `email` (sender). If matched, appends the message
 *   to the submission.messages array with the same shape used elsewhere in the app.
 * - Marks processed messages as Seen.
 *
 * Usage:
 * 1) Install deps: `yarn add imap-simple mailparser`
 * 2) Provide env vars (see below)
 * 3) Run once: `node scripts/imapWorker.mjs`
 * 4) Or run as a poller: `POLL_INTERVAL_MS=60000 node scripts/imapWorker.mjs`
 *
 * Required env vars:
 * - IMAP_HOST (e.g. imap.hostinger.com)
 * - IMAP_PORT (e.g. 993)
 * - IMAP_USER
 * - IMAP_PASS
 * - MONGODB_URI (connection string)
 * Optional:
 * - MAILBOX (default: INBOX)
 * - POLL_INTERVAL_MS (if provided the script will loop)
 */

import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { MongoClient, ObjectId } from 'mongodb';

const IMAP_HOST = process.env.IMAP_HOST;
const IMAP_PORT = Number(process.env.IMAP_PORT || 993);
const IMAP_USER = process.env.IMAP_USER;
const IMAP_PASS = process.env.IMAP_PASS;
const MAILBOX = process.env.MAILBOX || 'INBOX';
const POLL_INTERVAL_MS = process.env.POLL_INTERVAL_MS ? Number(process.env.POLL_INTERVAL_MS) : null;
const MONGODB_URI = process.env.MONGODB_URI;

if (!IMAP_HOST || !IMAP_USER || !IMAP_PASS || !MONGODB_URI) {
  console.error('Missing required env vars. Please set IMAP_HOST, IMAP_USER, IMAP_PASS and MONGODB_URI');
  process.exit(1);
}

async function processOnce() {
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
    onerror: (err) => console.error('IMAP error', err),
  };

  const connection = await imaps.connect(config);
  try {
    await connection.openBox(MAILBOX);

    // search for unseen messages
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = { bodies: [''], markSeen: false };
    const results = await connection.search(searchCriteria, fetchOptions);

    for (const res of results) {
      // res has attributes and parts
      const all = res.parts.find(p => p.which === '');
      const raw = all ? all.body : '';
      const parsed = await simpleParser(raw);

      const from = parsed.from?.value?.[0];
      const senderEmail = from?.address ?? String(parsed.from?.text ?? '');
      const senderName = from?.name ?? null;
      const subject = parsed.subject ?? null;
      const text = parsed.text ?? parsed.html ?? '';
      const inReplyTo = parsed.headers && parsed.headers.get ? parsed.headers.get('in-reply-to') : null;

      console.log('Processing message from', senderEmail, 'subject', subject);

      // try to find matching submission by inReplyTo first
      let matchedSubmission = null;
      let matchedReplyMessageId = null;

      if (inReplyTo) {
        // try to match by messageId or _id
        try {
          const oid = new ObjectId(String(inReplyTo).replace(/[<>]/g, ''));
          matchedSubmission = await submissions.findOne({ 'messages.messageId': oid });
          if (matchedSubmission) matchedReplyMessageId = String(oid);
        } catch (e) {
          // not an ObjectId — try string match
          matchedSubmission = await submissions.findOne({ $or: [{ 'messages.messageId': String(inReplyTo) }, { 'messages._id': String(inReplyTo) }] });
          if (matchedSubmission) matchedReplyMessageId = String(inReplyTo);
        }
      }

      if (!matchedSubmission && senderEmail) {
        matchedSubmission = await submissions.findOne({ email: senderEmail }, { sort: { updatedAt: -1, createdAt: -1 } });
      }

      if (!matchedSubmission) {
        console.log('No submission matched for', senderEmail, '— skipping');
        // mark seen to avoid reprocessing? We'll mark seen to avoid duplicate work
        if (res.attributes && res.attributes.uid) {
          await connection.addFlags(res.attributes.uid, '\\Seen');
        }
        continue;
      }

      // determine replyToMessageId (prefer inReplyTo or the most recent admin reply)
      if (!matchedReplyMessageId) {
        const msgs = Array.isArray(matchedSubmission.messages) ? matchedSubmission.messages : [];
        const adminReplies = msgs.filter(m => Boolean(m.fromAdmin));
        if (adminReplies.length > 0) {
          adminReplies.sort((a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime());
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

      const updateResult = await submissions.updateOne({ _id: matchedSubmission._id }, { $push: { messages: newEntry }, $set: { updatedAt: new Date() } });
      if (updateResult.modifiedCount > 0) {
        console.log('Appended inbound message to submission', String(matchedSubmission._id));
        // mark message seen
        if (res.attributes && res.attributes.uid) {
          await connection.addFlags(res.attributes.uid, '\\Seen');
        }
      } else {
        console.warn('Failed to append inbound message for', String(matchedSubmission._id));
      }
    }

  } finally {
    try { await connection.end(); } catch (e) {}
    try { await mongo.close(); } catch (e) {}
  }
}

async function run() {
  await processOnce();
  if (POLL_INTERVAL_MS) {
    console.log('Entering poll loop every', POLL_INTERVAL_MS, 'ms');
    setInterval(async () => {
      try { await processOnce(); } catch (e) { console.error('Poll error', e); }
    }, POLL_INTERVAL_MS);
  }
}

run().catch(err => {
  console.error('Worker fatal error', err);
  process.exit(1);
});
