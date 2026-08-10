import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    url:
      process.env['DATABASE_URL'] ??
      'postgresql://inversify:inversify@127.0.0.1:5432/inversify',
  },
  migrations: {
    path: 'prisma/migrations',
  },
  schema: 'prisma/schema.prisma',
});
