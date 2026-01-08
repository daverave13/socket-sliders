export const config = {
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
  },
  worker: {
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '2', 10),
    jobTimeout: parseInt(process.env.JOB_TIMEOUT_MS || '60000', 10), // 60 seconds
  },
  openscad: {
    templatesDir: process.env.TEMPLATES_DIR || '/opt/templates',
    artifactsDir: process.env.ARTIFACTS_DIR || '/data/artifacts',
    workspaceDir: process.env.WORKSPACE_DIR || '/tmp/work',
    executable: process.env.OPENSCAD_BIN || 'openscad',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;
