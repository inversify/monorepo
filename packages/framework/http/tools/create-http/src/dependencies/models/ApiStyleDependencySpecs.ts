import { ApiStyle } from '../../models/ApiStyle.js';
import { type AdapterDependencySpec } from './HttpAdapterDependencySpecs.js';

/**
 * Per-API-style dependency names. Versions are resolved from the
 * Renovate-tracked dependency catalog (`templates/base/package.json`).
 *
 * `esbuild` is a transitive install-time script of `tsx`; it is allow-listed
 * for pnpm / Yarn but is not a direct catalog dependency.
 */
export const API_STYLE_DEPENDENCY_SPECS: Record<
  ApiStyle,
  AdapterDependencySpec
> = {
  [ApiStyle.codeFirst]: {
    dependencies: [],
  },
  [ApiStyle.schemaFirst]: {
    builtDependencies: ['esbuild'],
    dependencies: [],
    devDependencies: ['@inversifyjs/open-api-2-typescript', 'tsx'],
  },
};
