import { NextApiRequest, NextApiResponse } from "next";
import getDb from "@/services/mongo";
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

    return res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error("Error saving form submission:", error);
    return res.status(500).json({ error: "Error saving form submission" });
  }
}
