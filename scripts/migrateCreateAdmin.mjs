import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// Try to load .env automatically if dotenv is available. This is optional -
// if dotenv is not installed you can still set env vars in the shell.
try {
  // top-level await is allowed in .mjs (ESM) modules in modern Node.js
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (e) {
  // not fatal; just inform the user how to enable it
  console.warn('dotenv not available; skipping .env load. To enable, run: npm install dotenv');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? 'devbutter';

if (!uri) {
  console.error('MONGODB_URI is not defined. Set it before running this script.');
  console.error('You can create a .env file at the project root with the following entries:');
  console.error('  MONGODB_URI="your-mongodb-connection-string"');
  console.error('  MONGODB_DB="devbutter"');
  console.error('  ADMIN_EMAIL="you@example.com"');
  console.error('  ADMIN_PASSWORD="change-me"');
  process.exit(1);
}

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME ?? 'Admin';

if (!adminEmail || !adminPassword) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment to create the initial admin user.');
  console.error('You can add them to a .env file or export them in your shell before running the script.');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    const users = db.collection('users');

    // ensure unique index on email
    try {
      await users.createIndex({ email: 1 }, { unique: true });
    } catch (err) {
      console.warn('Could not create unique index on users.email (might already exist):', err?.message || err);
    }

    // check if user exists
    const existing = await users.findOne({ email: adminEmail.toLowerCase() });
    if (existing) {
      console.log('Admin user already exists with email', adminEmail);
      process.exit(0);
    }

    const hash = await bcrypt.hash(adminPassword, 10);

    const doc = {
      name: adminName,
      email: adminEmail.toLowerCase(),
      hash_password: hash,
      createdAt: new Date(),
    };

    const result = await users.insertOne(doc);
    console.log('Inserted admin user with id', result.insertedId.toString());
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(2);
  } finally {
    await client.close();
  }
}

run();
