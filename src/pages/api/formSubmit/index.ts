import { NextApiRequest, NextApiResponse } from "next";
import getDb from "@/services/mongo";

interface FormBody {
  name?: string;
  email?: string;
  message?: string;
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

  try {
    const db = await getDb();
    const collection = db.collection("formSubmissions");

    // Check if a submission with this email already exists
    const existing = await collection.findOne({ email: body.email });

    if (existing) {
      // If message provided, push it into the messages array
      const toPush: string[] = [];
      if (body.message) toPush.push(body.message);

      const update: any = {
        $set: { name: body.name ?? existing.name, updatedAt: new Date() },
      };

      if (toPush.length > 0) {
        update.$push = { messages: { $each: toPush } };
      }

      const result = await collection.updateOne({ _id: existing._id }, update);

      return res.status(200).json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
    }

    // No existing document - create a new one with messages as an array
    const doc = {
      name: body.name,
      email: body.email,
      messages: body.message ? [body.message] : [],
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    return res.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error("Error saving form submission:", error);
    return res.status(500).json({ error: "Error saving form submission" });
  }
}
