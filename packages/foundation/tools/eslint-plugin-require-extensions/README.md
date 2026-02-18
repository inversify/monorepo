# @inversifyjs/eslint-plugin-require-extensions

ESLint plugin to enforce file extensions in ESM imports and exports.

## Installation

```bash
pnpm add -D @inversifyjs/eslint-plugin-require-extensions
```

## Usage

Add the plugin to your ESLint configuration:

```javascript
import requireExtensions from '@inversifyjs/eslint-plugin-require-extensions';

export default [
  {
    plugins: {
      'require-extensions': requireExtensions,
    },
    rules: {
      'require-extensions/require-extensions': 'error',
      'require-extensions/require-index': 'error',
    },
  },
];
```

## Rules

### require-extensions

Enforces that all relative imports and exports include a file extension.

### require-index

Enforces that directory imports and exports include an index file (e.g., `./foo` becomes `./foo/index.js`). This rule ensures that when importing from a directory, the path explicitly ends with `/index.js` (or the appropriate extension).

This rule is auto-fixable and accepts no configuration options.

## License

MIT
