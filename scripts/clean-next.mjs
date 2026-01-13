import { existsSync, readFileSync, rmSync } from "node:fs";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import net from "node:net";

const target = resolve(process.cwd(), ".next");
const lockPath = resolve(target, ".dev-server.lock");
const port = Number(process.env.PORT ?? 3011);

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

if (existsSync(lockPath)) {
  try {
    const payload = JSON.parse(readFileSync(lockPath, "utf8"));
    if (payload?.pid && isProcessAlive(payload.pid)) {
      console.error(
        `Refusing to delete .next while dev server is running (pid ${payload.pid}).`
      );
      process.exit(1);
    }
  } catch {
    // Ignore invalid lock file.
  }
  rmSync(lockPath, { force: true });
}

if (await isPortInUse(port)) {
  console.error(`Refusing to delete .next while port ${port} is in use.`);
  process.exit(1);
}

if (existsSync(target)) {
  await rm(target, { recursive: true, force: true });
}
