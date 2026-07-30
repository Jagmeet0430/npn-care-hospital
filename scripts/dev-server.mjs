import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { cleanNextCache, killPortListeners, sleep } from "./next-cache.mjs";

const cwd = process.cwd();
const port = process.env.PORT ?? "3000";

killPortListeners(port);
sleep(1000);
cleanNextCache(cwd);

const nextBin = path.join(cwd, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "dev", "--hostname", "127.0.0.1", "--port", port], {
  cwd,
  stdio: "inherit",
  shell: false
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
