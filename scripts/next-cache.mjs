import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const stalePrefix = ".next-stale-";

export function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function killPortListeners(port = process.env.PORT ?? "3000") {
  if (process.platform !== "win32") {
    return;
  }

  let output = "";
  try {
    output = execFileSync("netstat", ["-ano"], { encoding: "utf8" });
  } catch {
    return;
  }

  const pids = new Set();
  for (const line of output.split(/\r?\n/)) {
    const match = line.trim().match(/^TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)$/);
    if (match?.[1] === port && match[2] !== String(process.pid)) {
      pids.add(match[2]);
    }
  }

  for (const pid of pids) {
    try {
      execFileSync("taskkill", ["/PID", pid, "/F", "/T"], { stdio: "ignore" });
      console.log(`Stopped stale dev server on port ${port} (PID ${pid}).`);
    } catch {
      try {
        execFileSync("powershell.exe", ["-NoProfile", "-Command", `Stop-Process -Id ${pid} -Force -ErrorAction Stop`], {
          stdio: "ignore"
        });
        console.log(`Stopped stale dev server on port ${port} (PID ${pid}).`);
      } catch {
        console.warn(`Could not stop process ${pid} on port ${port}. Close it manually if Next reports EADDRINUSE.`);
      }
    }
  }
}

export function cleanNextCache(cwd = process.cwd()) {
  const nextDir = path.join(cwd, ".next");
  const resolvedCwd = path.resolve(cwd);
  const resolvedNext = path.resolve(nextDir);

  if (!resolvedNext.startsWith(resolvedCwd)) {
    throw new Error(`Refusing to clean path outside project: ${resolvedNext}`);
  }

  for (const entry of readdirSync(cwd, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith(stalePrefix)) continue;

    try {
      rmSync(path.join(cwd, entry.name), { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
    } catch {
      // Windows can temporarily lock old cache folders. They will be retried next startup.
    }
  }

  if (!existsSync(resolvedNext)) {
    return;
  }

  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      rmSync(resolvedNext, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 });
      console.log("Cleared generated .next cache.");
      return;
    } catch {
      if (attempt < 12) sleep(750);
    }
  }

  const staleDir = path.join(cwd, `${stalePrefix}${Date.now()}`);
  try {
    renameSync(resolvedNext, staleDir);
    console.log(`Moved locked .next cache to ${path.basename(staleDir)}. Next will rebuild from a clean cache.`);
  } catch (error) {
    console.error(
      `Could not clear or move .next because Windows still has files locked. Close running Node/Next terminals and run the command again. (${error.code ?? "UNKNOWN"})`
    );
    process.exit(1);
  }
}
