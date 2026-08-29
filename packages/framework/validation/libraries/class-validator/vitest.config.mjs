import { buildConfig } from '@inversifyjs/foundation-vitest-config';
import { transform } from 'rflct/transform';

const rflctOptions = {
  reflectAliases: {
    'BodyParam': { staticMetadata: { parameterType: 'body' } },
  },
  importSources: /@inversifyjs\//,
};

const TS_RE = /\.[cm]?tsx?$/;
const EXCLUDE_RE = /node_modules/;

const rflctPlugin = {
  name: 'rflct',
  enforce: 'pre',
  transform(code, id) {
    if (EXCLUDE_RE.test(id)) return null;
    if (!TS_RE.test(id)) return null;
    const result = transform(code, id, rflctOptions);
    if (!result.transformed) return null;
    return { code: result.code, map: null };
  },
};

export default buildConfig([rflctPlugin]);
