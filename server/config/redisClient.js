import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// If no REDIS_URL is configured, skip Redis entirely.
// The app runs fine without it — token blacklist will just be disabled.
if (!process.env.REDIS_URL) {
  console.warn("REDIS_URL not set — Redis disabled. Token blacklist will not be active.");
}

const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times >= 3) {
          console.warn("Redis connection failed after 3 attempts. Token blacklist disabled.");
          return null;
        }
        return Math.min(times * 200, 2000);
      }
    })
  : null;

if (redisClient) {
  redisClient.on("error", (err) => {
    if (err && err.message) {
      console.warn("Redis Error:", err.message);
    }
  });

  redisClient.on("connect", () => {
    console.log("Connected to Redis for token blacklist");
  });

  redisClient.connect().catch(() => {
    console.warn("Initial Redis connection failed, proceeding without Redis");
  });
}

export default redisClient;
