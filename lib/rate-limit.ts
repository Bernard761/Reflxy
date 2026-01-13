import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  reset: number;
  source: "upstash" | "memory";
};

const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const ratelimiters = new Map<string, Ratelimit>();
const memoryStore = new Map<string, { count: number; resetAt: number }>();

const getLimiter = (limit: number, windowMs: number) => {
  if (!hasUpstash) {
    return null;
  }

  const bucket = `${limit}:${windowMs}`;
  const cached = ratelimiters.get(bucket);
  if (cached) {
    return cached;
  }

  const seconds = Math.max(1, Math.ceil(windowMs / 1000));
  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, `${seconds} s`),
    analytics: true,
  });

  ratelimiters.set(bucket, limiter);
  return limiter;
};

const memoryLimit = ({ key, limit, windowMs }: RateLimitOptions): RateLimitResult => {
  const now = Date.now();
  if (memoryStore.size > 5000) {
    for (const [storedKey, entry] of memoryStore.entries()) {
      if (entry.resetAt <= now) {
        memoryStore.delete(storedKey);
      }
    }
  }
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      reset: now + windowMs,
      source: "memory",
    };
  }

  entry.count += 1;
  const allowed = entry.count <= limit;
  memoryStore.set(key, entry);

  return {
    allowed,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.resetAt,
    source: "memory",
  };
};

export const getClientIp = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
};

export const checkRateLimit = async (
  options: RateLimitOptions
): Promise<RateLimitResult> => {
  const limiter = getLimiter(options.limit, options.windowMs);

  if (!limiter) {
    return memoryLimit(options);
  }

  const result = await limiter.limit(options.key);

  return {
    allowed: result.success,
    remaining: result.remaining,
    reset: result.reset,
    source: "upstash",
  };
};
