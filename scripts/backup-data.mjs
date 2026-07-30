import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data");
const backupDir = path.join(root, "backups");

function encryptionKey() {
  const secret = process.env.BACKUP_ENCRYPTION_KEY ?? process.env.DATA_ENCRYPTION_KEY ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Set BACKUP_ENCRYPTION_KEY, DATA_ENCRYPTION_KEY, or NEXTAUTH_SECRET before creating backups.");
  }

  return createHash("sha256").update(secret).digest();
}

async function readDirectory(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = {};

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(base, fullPath).replaceAll("\\", "/");

    if (entry.isDirectory()) {
      Object.assign(files, await readDirectory(fullPath, base));
    } else if (entry.isFile()) {
      files[relativePath] = (await readFile(fullPath)).toString("base64");
    }
  }

  return files;
}

async function main() {
  const payload = {
    createdAt: new Date().toISOString(),
    files: await readDirectory(dataDir)
  };

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const output = {
    encrypted: true,
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    payload: encrypted.toString("base64")
  };

  await mkdir(backupDir, { recursive: true });
  const filename = `data-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json.enc`;
  await writeFile(path.join(backupDir, filename), `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Encrypted backup created: backups/${filename}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
