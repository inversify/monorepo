import { type Prisma } from '../../../../generated/prisma/client.js';
import { ErrorTraceFixtures } from '../../../domain/fixtures/ErrorTraceFixtures.js';

export const errorTracesJson: Prisma.JsonValue = [
  ErrorTraceFixtures.any,
] as unknown as Prisma.JsonValue;
