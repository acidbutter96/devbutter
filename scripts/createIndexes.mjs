import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI ?? 'mongodb+srv://Vercel-Admin-devbutter-db:njJzrsXY6OsVSLOh@devbutter-db.yvuemjj.mongodb.net/?retryWrites=true&w=majority';
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
    const coll = db.collection('formSubmissions');

    console.log('Creating unique index on email (if not exists)...');
    // We normalize emails to lowercase before storing, so a simple unique index suffices
    const result = await coll.createIndex({ email: 1 }, { unique: true });
    console.log('Index created:', result);
  } catch (err) {
    console.error('Error creating index:', err);
    process.exit(2);
  } finally {
    await client.close();
  }
}

run();
