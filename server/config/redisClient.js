import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Initialize Redis client
// If REDIS_URL is not set, it defaults to localhost:6379
const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  // Graceful fallback settings
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    // Stop retrying after 3 attempts, allowing the app to degrade gracefully
    if (times >= 3) {
      console.warn("Redis connection failed. Blacklist will be temporarily disabled.");
      return null; 
    }
    return Math.min(times * 50, 2000);
  }
});

redisClient.on("error", (err) => {
  console.warn("Redis Error:", err.message);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis for token blacklist");
});

// Connect lazily (does not block app startup if Redis is down)
redisClient.connect().catch((err) => {
  console.warn("Initial Redis connection failed, proceeding without Redis");
});

export default redisClient;
