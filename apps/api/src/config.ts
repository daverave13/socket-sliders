export const config = {
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
  },
  artifacts: {
    dir: process.env.ARTIFACTS_DIR || '/data/artifacts',
    maxAge: parseInt(process.env.ARTIFACTS_MAX_AGE_MS || '86400000', 10), // 24 hours
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;
