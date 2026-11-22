const crypto = require("crypto");
const { createClient } = require("redis");

const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 60);
const EVENT_CHANNEL = "proj214k:events";
const CATALOG_VERSION_KEY = "catalog:version";

if (!Number.isInteger(CACHE_TTL_SECONDS) || CACHE_TTL_SECONDS < 1) {
  throw new Error("CACHE_TTL_SECONDS must be a positive integer");
}

let client;
let connection;
let missingRedisUrlLogged = false;
let redisUnavailableUntil = 0;
let eventConsumerStarted = false;

const createRedisClient = () => {
  if (!process.env.REDIS_URL) {
    if (!missingRedisUrlLogged) {
      console.warn("Redis is not configured; catalog caching and events are disabled");
      missingRedisUrlLogged = true;
    }
    return null;
  }

  if (Date.now() < redisUnavailableUntil) return null;

  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 1500,
        reconnectStrategy: (retries) => retries > 2 ? false : Math.min(retries * 100, 500),
      },
    });
    client.on("error", (error) => {
      console.error("Redis client error:", error.message);
    });
  }
  return client;
};

const getRedisClient = async () => {
  const redis = createRedisClient();
  if (!redis) return null;
  if (!redis.isOpen) {
    connection ??= redis.connect()
      .then(() => redis)
      .catch((error) => {
        if (client === redis) client = undefined;
        redis.destroy();
        redisUnavailableUntil = Date.now() + 5000;
        console.error("Redis connection failed; catalog will use MySQL:", error.message);
        return null;
      })
      .finally(() => {
        connection = undefined;
      });
    await connection;
  }
  return redis.isOpen ? redis : null;
};

const catalogCacheKey = async (key) => {
  const redis = await getRedisClient();
  if (!redis) return null;
  const version = (await redis.get(CATALOG_VERSION_KEY)) || "0";
  return { redis, key: `catalog:v${version}:${key}` };
};

const getCached = async (key) => {
  try {
    const target = await catalogCacheKey(key);
    if (!target) return null;
    const value = await target.redis.get(target.key);
    if (value === null) {
      console.info(JSON.stringify({ level: "info", event: "cache.miss", key }));
      return null;
    }
    console.info(JSON.stringify({ level: "info", event: "cache.hit", key }));
    return JSON.parse(value);
  } catch (error) {
    console.warn(`Redis cache read failed for ${key}:`, error.message);
    return null;
  }
};

const setCached = async (key, value) => {
  try {
    const target = await catalogCacheKey(key);
    if (!target) return;
    await target.redis.set(target.key, JSON.stringify(value), {
      EX: CACHE_TTL_SECONDS,
    });
  } catch (error) {
    console.warn(`Redis cache write failed for ${key}:`, error.message);
  }
};

const signEvent = (event, secret) =>
  crypto.createHmac("sha256", secret).update(JSON.stringify(event)).digest("hex");

const verifyEvent = (message, secret) => {
  try {
    const envelope = JSON.parse(message);
    if (!envelope?.event || typeof envelope.signature !== "string") return null;
    const expected = Buffer.from(signEvent(envelope.event, secret), "hex");
    const actual = Buffer.from(envelope.signature, "hex");
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
    return envelope.event;
  } catch {
    return null;
  }
};

const publishEvent = async (type, data) => {
  const secret = process.env.EVENT_SIGNING_SECRET;
  if (!secret) {
    console.warn(`Event ${type} was not published: EVENT_SIGNING_SECRET is not configured`);
    return;
  }

  try {
    const redis = await getRedisClient();
    if (!redis) return;
    const event = {
      eventId: crypto.randomUUID(),
      type,
      occurredAt: new Date().toISOString(),
      data,
    };
    await redis.publish(EVENT_CHANNEL, JSON.stringify({
      event,
      signature: signEvent(event, secret),
    }));
    console.info(`Published signed event ${event.eventId} (${type})`);
  } catch (error) {
    console.error(`Redis event publish failed for ${type}:`, error.message);
  }
};

const invalidateCatalog = async () => {
  try {
    const redis = await getRedisClient();
    if (redis) {
      const version = await redis.incr(CATALOG_VERSION_KEY);
      console.info(JSON.stringify({ level: "info", event: "cache.invalidated", version }));
    }
  } catch (error) {
    console.error("Redis catalog cache invalidation failed:", error.message);
  }
};

const startEventConsumer = async () => {
  const secret = process.env.EVENT_SIGNING_SECRET;
  if (!secret) {
    console.warn("Redis event consumer is disabled: EVENT_SIGNING_SECRET is not configured");
    return;
  }

  try {
    const publisher = await getRedisClient();
    if (!publisher) {
      const retry = setTimeout(() => void startEventConsumer(), 5000);
      retry.unref();
      return;
    }
    if (eventConsumerStarted) return;
    const subscriber = publisher.duplicate();
    subscriber.on("error", (error) => {
      console.error("Redis event subscriber error:", error.message);
    });
    await subscriber.connect();
    await subscriber.subscribe(EVENT_CHANNEL, (message) => {
      const event = verifyEvent(message, secret);
      if (!event) {
        console.error("Rejected Redis event with an invalid signature");
        return;
      }
      console.info(`Consumed signed event ${event.eventId} (${event.type})`);
    });
    eventConsumerStarted = true;
    console.info(`Consuming signed Redis events on ${EVENT_CHANNEL}`);
  } catch (error) {
    console.error("Could not start Redis event consumer:", error.message);
    const retry = setTimeout(() => void startEventConsumer(), 5000);
    retry.unref();
  }
};

module.exports = {
  getCached,
  setCached,
  invalidateCatalog,
  publishEvent,
  startEventConsumer,
  signEvent,
  verifyEvent,
};
