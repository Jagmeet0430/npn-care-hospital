import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const clientIndex = path.join(process.cwd(), "node_modules", ".prisma", "client", "index.js");
const engineFile = path.join(process.cwd(), "node_modules", ".prisma", "client", "query_engine-windows.dll.node");

const result = process.platform === "win32"
  ? spawnSync("cmd.exe", ["/d", "/s", "/c", "npx prisma generate"], { encoding: "utf8" })
  : spawnSync("npx", ["prisma", "generate"], { encoding: "utf8" });

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if (result.status !== 0 || result.error) {
  const message = `${result.stdout ?? ""}${result.stderr ?? ""}${result.error?.message ?? ""}`;
  const isWindowsLockedEngine = process.platform === "win32" && message.includes("EPERM") && message.includes("query_engine-windows.dll.node");
  const hasUsableClient = existsSync(clientIndex) && existsSync(engineFile);

  if (isWindowsLockedEngine && hasUsableClient) {
    console.warn("Prisma generate could not replace the locked Windows query engine, so the existing generated client will be reused.");
    process.exit(0);
  }

  if (result.error) {
    throw result.error;
  }

  process.exit(result.status ?? 1);
}
