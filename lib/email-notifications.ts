import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type EmailNotification = {
  id: string;
  to: string;
  subject: string;
  body: string;
  createdAt: string;
  status: "queued";
};

const outboxPath = path.join(process.cwd(), "data", "email-outbox.json");

async function readOutbox(): Promise<EmailNotification[]> {
  try {
    return JSON.parse(await readFile(outboxPath, "utf8")) as EmailNotification[];
  } catch {
    return [];
  }
}

export async function queueEmailNotification(notification: Omit<EmailNotification, "id" | "createdAt" | "status">) {
  const outbox = await readOutbox();
  const queued: EmailNotification = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "queued",
    ...notification
  };

  await mkdir(path.dirname(outboxPath), { recursive: true });
  await writeFile(outboxPath, `${JSON.stringify([queued, ...outbox], null, 2)}\n`, "utf8");
  return queued;
}
