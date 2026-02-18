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
    },
  },
];
```

## Rules

### require-extensions

Enforces that all relative imports and exports include a file extension.

## License

MIT
