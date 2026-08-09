import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: 'file:./prisma/dev.db',
  },
  migrations: {
    path: 'prisma/migrations',
  },
  schema: 'prisma/schema.prisma',
});
