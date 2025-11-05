import { NextApiRequest, NextApiResponse } from "next";
import getDb from "@/services/mongo";
import { ObjectId } from "mongodb";
import { verifyTokenAndSession, unauthorized as authUnauthorized } from '@/services/auth';

interface SafeMessageResponse {
  messageId: string | null;
  createdAt: string;
  message: string | null;
  subject: string | null;
  telephone: string | null;
  name: string | null;
  read: boolean;
  sendStatus?: string | null;
  sendLog?: string | null;
}

interface SafeSubmissionResponse {
  _id: string;
  email: string;
  createdAt: string | null;
  updatedAt: string | null;
  messages: SafeMessageResponse[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await verifyTokenAndSession(req);
    if (!session) return authUnauthorized(res);
  } catch (err) {
    console.error('Auth check failed', err);
    return authUnauthorized(res);
  }

  if (req.method === "GET") {
    try {
      const db = await getDb();
      const collection = db.collection("formSubmissions");
      const submissions = await collection
        .find({})
        .sort({ updatedAt: -1, createdAt: -1 })
        .toArray();

      const safeResponse: SafeSubmissionResponse[] = submissions.map(submission => {
        const createdAt = submission.createdAt instanceof Date ? submission.createdAt.toISOString() : submission.createdAt ?? null;
        const updatedAt = submission.updatedAt instanceof Date ? submission.updatedAt.toISOString() : submission.updatedAt ?? null;

        const messages: SafeMessageResponse[] = Array.isArray(submission.messages)
          ? submission.messages.map((rawMessage: any) => {
              const messageId = rawMessage.messageId
                ? rawMessage.messageId instanceof ObjectId
                  ? rawMessage.messageId.toHexString()
                  : String(rawMessage.messageId)
                : rawMessage._id instanceof ObjectId
                ? rawMessage._id.toHexString()
                : null;

              let createdAtIso: string;
              if (rawMessage.createdAt instanceof Date) {
                createdAtIso = rawMessage.createdAt.toISOString();
              } else if (typeof rawMessage.createdAt === "string") {
                createdAtIso = rawMessage.createdAt;
              } else {
                createdAtIso = new Date().toISOString();
              }

              return {
                messageId,
                createdAt: createdAtIso,
                message: rawMessage.message ?? null,
                subject: rawMessage.subject ?? null,
                telephone: rawMessage.telephone ?? null,
                name: rawMessage.name ?? null,
                read: Boolean(rawMessage.read),
                sendStatus: rawMessage.sendStatus ?? null,
                sendLog: rawMessage.sendLog ? String(rawMessage.sendLog) : null,
              };
            })
          : [];

        return {
          _id: submission._id instanceof ObjectId ? submission._id.toHexString() : String(submission._id),
          email: submission.email ?? "",
          createdAt,
          updatedAt,
          messages,
        };
      });

      return res.status(200).json(safeResponse);
    } catch (error) {
      console.error("Error fetching form submissions", error);
      return res.status(500).json({ error: "Error fetching form submissions" });
    }
  }

  if (req.method === "PATCH") {
    const submissionId = req.body?.submissionId as string | undefined;
    const messageId = req.body?.messageId as string | undefined;
    const createdAt = req.body?.createdAt as string | undefined;

    if (!submissionId) {
      return res.status(400).json({ error: "submissionId is required" });
    }

    if (!messageId && !createdAt) {
      return res.status(400).json({ error: "messageId or createdAt is required" });
    }

    try {
      const db = await getDb();
      const collection = db.collection("formSubmissions");

      const baseFilter: Record<string, unknown> = {};
      try {
        baseFilter._id = new ObjectId(submissionId);
      } catch (error) {
        return res.status(400).json({ error: "Invalid submissionId" });
      }

      const filter: Record<string, unknown> = { ...baseFilter };

      if (messageId) {
        try {
          filter["messages.messageId"] = new ObjectId(messageId);
        } catch (error) {
          filter["messages.messageId"] = messageId;
        }
      } else if (createdAt) {
        const createdAtDate = new Date(createdAt);
        if (!Number.isNaN(createdAtDate.getTime())) {
          filter["messages.createdAt"] = createdAtDate;
        } else {
          filter["messages.createdAt"] = createdAt;
        }
      }

      const updateResult = await collection.updateOne(filter, {
        $set: { "messages.$.read": true, updatedAt: new Date() },
      });

      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ error: "Message not found" });
      }

      return res.status(200).json({ matchedCount: updateResult.matchedCount, modifiedCount: updateResult.modifiedCount });
    } catch (error) {
      console.error("Error marking message as read", error);
      return res.status(500).json({ error: "Error updating message" });
    }
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).end("Method Not Allowed");
}
