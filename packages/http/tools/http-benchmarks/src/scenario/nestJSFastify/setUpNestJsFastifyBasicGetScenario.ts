import { NestApplication, NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';

import { BasicGetAppModule } from '../nestJS/BasicGetAppModule';

async function setUp(): Promise<void> {
  const app: NestApplication = await NestFactory.create(
    BasicGetAppModule,
    new FastifyAdapter({ logger: false }),
  );

  await app.listen(3000, '0.0.0.0');
}

void setUp();
