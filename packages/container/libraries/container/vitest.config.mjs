import { defaultConfig } from '@inversifyjs/foundation-vitest-config';
import { transform } from 'rflct/transform';

const rflctOptions = {
  reflectAliases: {
    'Inject': {},
    'InjectOptional': { staticMetadata: { optional: true } },
    'InjectNamed': { typeParamToMeta: { name: 0 } },
    'InjectTagged': { tagsFromParams: { keyParam: 0, valueParam: 1 } },
    'InjectMulti': { staticMetadata: { multi: true }, isArray: true },
    'InjectMultiChained': { staticMetadata: { multi: true, chained: true }, isArray: true },
    'InjectUnmanaged': { staticMetadata: { unmanaged: true } },
    'PostConstruct': { staticMetadata: { postConstruct: true } },
    'PreDestroy': { staticMetadata: { preDestroy: true } },
  },
  classMetadataAliases: ['Injectable'],
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

export default {
  ...defaultConfig,
  plugins: [rflctPlugin],
};
