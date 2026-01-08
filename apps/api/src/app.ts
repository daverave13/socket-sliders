import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { config } from './config.js';
import { jobRoutes } from './routes/jobs.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.logging.level,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // CORS
  await app.register(cors, {
    origin: config.cors.origin,
  });

  // Static file serving for artifacts
  await app.register(fastifyStatic, {
    root: config.artifacts.dir,
    prefix: '/artifacts/',
    decorateReply: false,
  });

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Job routes
  await app.register(jobRoutes, { prefix: '/api/v1' });

  return app;
}
