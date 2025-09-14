# AGENTS.md - Foundation Tools

## Package Overview

This directory contains shared foundation tooling packages that provide common configurations for ESLint, Prettier, TypeScript, Rollup, Vitest, and Stryker across the entire monorepo.

## Package Types

### Configuration Packages
- **eslint-config**: Shared ESLint configuration
- **prettier-config**: Shared Prettier configuration  
- **typescript-config**: Shared TypeScript configurations
- **rollup-config**: Shared Rollup build configuration
- **vitest-config**: Shared Vitest test configuration
- **stryker-config**: Shared Stryker mutation testing configuration

### Utility Packages
- **scripts**: Common build and utility scripts

## Working with Foundation Packages

### Key Characteristics
- These packages provide **configuration only** - no runtime code
- No unit tests required (configuration packages)
- Changes affect the entire monorepo
- Use `exports` field to expose configuration files

### Development Guidelines

#### Making Configuration Changes
```bash
# Test configuration changes across multiple packages
pnpm run --filter="@inversifyjs/framework-*" lint
pnpm run --filter="@inversifyjs/container-*" test

# Verify builds work with new configs
pnpm run build
```

#### Testing Configuration Impact
1. **ESLint changes**: Run `pnpm run lint` across affected packages
2. **TypeScript changes**: Run `pnpm run build` to verify compilation
3. **Vitest changes**: Run `pnpm run test` to verify test execution
4. **Prettier changes**: Run `pnpm run format` to verify formatting

### Common Tasks

#### Adding New ESLint Rules
1. Update `packages/foundation/tools/eslint-config/index.js`
2. Test with: `pnpm run --filter="*" lint`
3. Fix any violations before committing

#### Updating TypeScript Configuration
1. Modify base configs in `typescript-config/`
2. Test compilation: `pnpm run build`
3. Verify both CJS and ESM builds work

#### Modifying Test Configuration
1. Update `vitest-config/lib/index.js`
2. Test across package types: `pnpm run test`
3. Verify unit, integration, and type tests still work

## Important Notes

### Breaking Changes
- Configuration changes can break builds across the entire monorepo
- Always test thoroughly before committing
- Consider backward compatibility when possible

### Dependencies
- Keep peer dependencies minimal and well-documented
- Foundation packages should have minimal runtime dependencies
- Use exact versions for critical build tools

### No Testing Required
- Configuration packages typically don't need unit tests
- The "test" is whether they work correctly when consumed
- Integration testing happens at the consuming package level
