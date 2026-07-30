import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { cleanNextCache, killPortListeners, sleep } from "./next-cache.mjs";

const cwd = process.cwd();
const port = process.env.PORT ?? "3000";

killPortListeners(port);
sleep(1000);
cleanNextCache(cwd);

const nextBin = path.join(cwd, "node_modules", "next", "dist", "bin", "next");
const result = spawnSync(process.execPath, [nextBin, "build"], {
  cwd,
  stdio: "inherit",
  shell: false
});

if (result.signal) {
  process.kill(process.pid, result.signal);
}

process.exit(result.status ?? 1);
