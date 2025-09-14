# AGENTS.md

## Project Overview

This is the InversifyJS monorepo - a TypeScript dependency injection library ecosystem. The repository contains multiple packages organized into categories:

- **Framework packages**: Core framework and HTTP functionality
- **Container packages**: DI container implementation, plugins, and examples
- **Foundation packages**: Shared tooling (ESLint, Prettier, TypeScript configs)
- **Documentation packages**: Code examples and website services
- **Logger package**: Logging utilities
- **JSON Schema packages**: Schema validation utilities
- **Open API packages**: OpenAPI integration

## Build and Test Commands

### Setup
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run all tests
pnpm test
```

### Development Workflow
```bash
# Format code
pnpm run format

# Lint code
pnpm run lint

# Run tests for a specific package
pnpm run --filter "@inversifyjs/package-name" test

# Run only unit tests
pnpm run test:unit

# Run only integration tests  
pnpm run test:integration

# Run tests with coverage
pnpm run test:coverage

```

### Working with Specific Packages
```bash
# Build a specific package
pnpm run --filter "@inversifyjs/package-name" build

# Test a specific package
pnpm run --filter "@inversifyjs/package-name" test

# Format a specific package
pnpm run --filter "@inversifyjs/package-name" format
```

## Code Style Guidelines

- **TypeScript**: Strict mode enabled across all packages
- **Testing**: Use Vitest with extensive unit and integration test coverage
- **Mocking**: External modules are mocked using `vitest.fn()`
- **Formatting**: Prettier configuration shared via `@inversifyjs/foundation-prettier-config`
- **Linting**: ESLint configuration shared via `@inversifyjs/foundation-eslint-config`

## Testing Instructions

The project follows a comprehensive testing strategy with multiple test types:

### Test Types
- **Unit Tests** (`*.spec.ts`): Test individual functions/classes in isolation
- **Integration Tests** (`*.int.spec.ts`): Test component interactions
- **End-to-End Tests**: Full system tests (some packages)
- **Type Tests** (`*.spec-d.ts`): TypeScript type checking tests

### Test Structure
Follow the structured testing patterns documented in:
- [Unit Testing Guidelines](./docs/testing/unit-testing.md)
- [Test Fixtures Guidelines](./docs/testing/fixtures.md)

### Key Testing Principles
1. **Four-layer describe structure**: Class → Method → Input → Flow scopes
2. **Vitest mocking**: Use `vitest.fn()` and `vitest.mock()` for external dependencies
3. **Fixture classes**: Create reusable test fixtures with static methods
4. **Clear naming**: Use descriptive test names with "when called, and [condition]" pattern

### Running Tests
```bash
# Run all tests
pnpm test

# Run only unit tests
pnpm run test:unit

# Run only integration tests
pnpm run test:integration

# Run tests for uncommitted changes
pnpm run test:uncommitted

# Run with coverage
pnpm run test:coverage
```

## Package Types and Structure

### Core Library Packages
Main implementation packages with dual CJS/ESM builds:
- `/packages/framework/core/` - Framework core
- `/packages/container/libraries/` - Container implementations
- `/packages/logger/` - Logging utilities

**Standard structure:**
- `src/` - TypeScript source code
- `lib/cjs/` - CommonJS build output
- `lib/esm/` - ES Module build output
- `vitest.config.mjs` - Test configuration
- Standard scripts: `build`, `test`, `lint`, `format`

### Example Packages
Demonstration packages (usually no tests):
- `/packages/container/examples/` - Usage examples
- `/packages/docs/tools/` - Code examples for documentation

### Foundation Packages
Shared tooling and configuration:
- `/packages/foundation/tools/` - Shared configs (ESLint, Prettier, TypeScript, etc.)

### Documentation Services
Docusaurus-based documentation sites:
- `/packages/docs/services/` - Documentation websites

## Monorepo Architecture

### Workspace Configuration
- **Package Manager**: pnpm with workspaces
- **Build Tool**: Turbo for task orchestration
- **Dependency Management**: Workspace protocol for internal dependencies

### Build System
- **TypeScript**: Multiple tsconfig files for different output formats
- **Rollup**: ES module builds
- **SWC**: Fast TypeScript compilation for tests
- **Turbo**: Cached, parallelized builds

### Quality Assurance
- **Pre-commit Hooks**: Husky with lint-staged
- **Commitlint**: Conventional commit messages
- **Changesets**: Version management and changelogs

## Security Considerations

- All packages use workspace protocol for internal dependencies
- Development dependencies are pinned to specific versions
- No known security vulnerabilities in production dependencies
- Type-safe dependency injection prevents runtime injection attacks

## Pull Request Guidelines

1. **Branch Naming**: Use descriptive feature branch names
2. **Commit Messages**: Follow conventional commit format
3. **Testing**: All changes must include appropriate tests
4. **Build**: Ensure `pnpm run build` passes
5. **Linting**: Ensure `pnpm run lint` passes
6. **Coverage**: Maintain or improve test coverage
7. **Documentation**: Update relevant docs for public API changes

## Performance Considerations

- Turbo caching significantly speeds up repeated builds

## Common Tasks

### Adding a New Package
1. Create package directory following existing structure
2. Add to `pnpm-workspace.yaml`
3. Configure `package.json` with standard scripts
4. Add appropriate tsconfig files
5. Configure Vitest, ESLint, and Prettier
6. Add to Turbo build pipeline if needed

### Debugging Build Issues
- Check Turbo cache: builds are cached by input file hashes
- Verify TypeScript configurations for target output format
- Ensure all workspace dependencies are properly declared
- Use `--filter` flag to isolate specific package issues

### Working with Dependencies
- Use `workspace:*` protocol for internal dependencies
- Run `pnpm install` after adding new dependencies
- Check `knip` output for unused dependencies: `pnpm run unused`
