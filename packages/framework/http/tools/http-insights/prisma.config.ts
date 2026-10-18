import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: 'file:./.inversify/insights.db',
  },
  migrations: {
    path: 'prisma/migrations',
  },
  schema: 'prisma/schema.prisma',
});
