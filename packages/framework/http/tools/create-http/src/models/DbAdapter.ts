export enum DbAdapter {
  prismaPostgresql = 'prisma+postgresql',
}

export const DB_ADAPTERS: readonly DbAdapter[] = [DbAdapter.prismaPostgresql];

export const DEFAULT_DB_ADAPTER: DbAdapter = DbAdapter.prismaPostgresql;
