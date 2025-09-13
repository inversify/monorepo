import { NestApplication, NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';

import { DEFAULT_PORT } from '../../constant/defaultPort';
import { BasicGetAppModule } from '../../scenario/nestJs/BasicGetAppModule';

async function setUp(): Promise<void> {
  const app: NestApplication = await NestFactory.create(
    BasicGetAppModule,
    new FastifyAdapter({ logger: false }),
  );

  await app.listen(DEFAULT_PORT, '0.0.0.0');
}

void setUp();
