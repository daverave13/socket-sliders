import { buildApp } from './app.js';
import { config } from './config.js';
import { closeQueue } from './queues/job.queue.js';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({
      host: config.server.host,
      port: config.server.port,
    });

    app.log.info(
      {
        host: config.server.host,
        port: config.server.port,
        redis: `${config.redis.host}:${config.redis.port}`,
      },
      'API server started'
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down API gracefully...');
  await closeQueue();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
