import { NestApplication, NestFactory } from '@nestjs/core';

import { BasicGetAppModule } from '../nestJS/BasicGetAppModule';

async function setUp(): Promise<void> {
  const app: NestApplication = await NestFactory.create(BasicGetAppModule, {
    logger: false,
  });

  await app.listen(3000);
}

void setUp();
