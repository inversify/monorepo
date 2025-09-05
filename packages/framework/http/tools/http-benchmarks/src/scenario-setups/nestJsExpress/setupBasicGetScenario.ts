import { NestApplication, NestFactory } from '@nestjs/core';

import { DEFAULT_PORT } from '../../constant/defaultPort';
import { BasicGetAppModule } from '../../scenario/nestJs/BasicGetAppModule';

async function setUp(): Promise<void> {
  const app: NestApplication = await NestFactory.create(BasicGetAppModule, {
    logger: false,
  });

  await app.listen(DEFAULT_PORT);
}

void setUp();
