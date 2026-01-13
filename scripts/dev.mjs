import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import net from "node:net";

const port = Number(process.env.PORT ?? 3011);
const nextBin = resolve(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "next.cmd" : "next"
);
const nextDir = resolve(process.cwd(), ".next");
const lockPath = resolve(nextDir, ".dev-server.lock");

const isProcessAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
};

const isPortInUse = (targetPort) =>
  new Promise((resolvePromise) => {
    const tester = net
      .createServer()
      .once("error", (error) => {
        resolvePromise(error?.code === "EADDRINUSE");
      })
      .once("listening", () => {
        tester.close(() => resolvePromise(false));
      })
      .listen(targetPort, "127.0.0.1");
  });

const ensureLock = async () => {
  if (existsSync(lockPath)) {
    try {
      const payload = JSON.parse(readFileSync(lockPath, "utf8"));
      if (payload?.pid && isProcessAlive(payload.pid)) {
        console.error(
          `A dev server is already running (pid ${payload.pid}) on port ${payload.port ?? port}.`
        );
        process.exit(1);
      }
    } catch {
      // Ignore invalid lock file and refresh it.
    }
    rmSync(lockPath, { force: true });
  }

  if (await isPortInUse(port)) {
    console.error(`Port ${port} is already in use. Stop the running server first.`);
    process.exit(1);
  }

  mkdirSync(nextDir, { recursive: true });
  writeFileSync(
    lockPath,
    JSON.stringify({ pid: process.pid, port, startedAt: new Date().toISOString() })
  );
};

const cleanupLock = () => {
  if (existsSync(lockPath)) {
    rmSync(lockPath, { force: true });
  }
};

if (!existsSync(nextBin)) {
  console.error("Next.js is not installed. Run `npm install` first.");
  process.exit(1);
}

await ensureLock();

const child = spawn(nextBin, ["dev"], {
  stdio: "inherit",
  env: { ...process.env, PORT: String(port) },
});

const shutdown = (signal) => {
  if (child?.pid) {
    child.kill(signal);
  }
  cleanupLock();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("exit", cleanupLock);

child.on("exit", (code) => {
  cleanupLock();
  process.exit(code ?? 0);
});
