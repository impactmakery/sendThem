import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env from monorepo root
dotenv.config({ path: resolve(import.meta.dirname, '../../../.env') });

import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import { loadEnv } from './config/env';
import { healthRoutes } from './routes/health';
import { meRoutes } from './routes/me';
import { campaignRoutes } from './routes/campaigns';
import { uploadRoutes } from './routes/upload';
import { creditRoutes } from './routes/credits';

async function main() {
  const env = loadEnv();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // Plugins
  await app.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  });
  await app.register(cookie);
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  // Routes
  await app.register(healthRoutes);
  await app.register(meRoutes);
  await app.register(campaignRoutes);
  await app.register(uploadRoutes);
  await app.register(creditRoutes);

  // Start
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`Server running at http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
