import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? 'devbutter';

if (!uri) {
  console.error('MONGODB_URI is not defined. Set it and re-run.');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const coll = db.collection('imapMessages');

    console.log('Creating index on processedAt (descending)...');
    await coll.createIndex({ processedAt: -1 });

    console.log('Creating index on matchedSubmissionId...');
    await coll.createIndex({ matchedSubmissionId: 1 });

    console.log('Creating index on appended flag...');
    await coll.createIndex({ appended: 1 });

    const ttl = Number(process.env.IMAP_LOG_TTL_SECONDS ?? 0);
    if (ttl > 0) {
      console.log(`Creating TTL index on processedAt (expire after ${ttl}s)...`);
      await coll.createIndex({ processedAt: 1 }, { expireAfterSeconds: ttl });
    } else {
      console.log('IMAP_LOG_TTL_SECONDS not set or 0 — skipping TTL index.');
    }

    console.log('Indexes created for imapMessages.');
  } catch (err) {
    console.error('Error creating imapMessages indexes:', err);
    process.exit(2);
  } finally {
    await client.close();
  }
}

run();
