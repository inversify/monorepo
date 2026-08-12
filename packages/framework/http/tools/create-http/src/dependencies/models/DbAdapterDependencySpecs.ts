import { type DbAdapter } from '../../models/DbAdapter.js';
import { type AdapterDependencySpec } from './HttpAdapterDependencySpecs.js';

/**
 * Per-database-adapter dependency names. Versions are resolved from the
 * Renovate-tracked dependency catalog (`templates/base/package.json`).
 */
export const DB_ADAPTER_DEPENDENCY_SPECS: Record<
  DbAdapter,
  AdapterDependencySpec
> = {
  'prisma+postgresql': {
    builtDependencies: ['@prisma/engines', '@scarf/scarf', 'prisma'],
    dependencies: [
      '@inversifyjs/prisma',
      '@prisma/adapter-pg',
      '@prisma/client',
      'pg',
    ],
    devDependencies: ['dotenv', 'prisma'],
  },
};
