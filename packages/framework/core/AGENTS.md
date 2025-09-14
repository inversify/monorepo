# AGENTS.md - Framework Core

## Package Overview

This is the InversifyJS framework core package that provides foundational framework functionality and utilities for building applications with dependency injection.

## Testing Requirements

This package requires **comprehensive unit testing** following the [testing guidelines](../../docs/testing/unit-testing.md).

### Test Structure
Follow the four-layer describe structure:
1. **Class scope** - `describe(ClassName, () => ...)`
2. **Method scope** - `describe('.methodName', () => ...)`  
3. **Input scope** - `describe('having specific input', () => ...)`
4. **Flow scope** - `describe('when called, and [condition]', () => ...)`

### Testing Commands
```bash
# Run all tests
pnpm run test

# Run only unit tests
pnpm run test:unit

# Run only integration tests
pnpm run test:integration

# Run with coverage
pnpm run test:coverage

# Test uncommitted changes only
pnpm run test:uncommitted
```

## Development Guidelines

### Code Quality
- **TypeScript strict mode** - all code must compile without errors
- **ESLint compliance** - follow the shared ESLint configuration
- **Prettier formatting** - code must be properly formatted
- **Type safety** - avoid `any` type, use proper generics

### Testing Requirements
- **Unit tests required** for all public methods and classes
- **Mock external dependencies** using `vitest.fn()` and `vitest.mock()`
- **Create fixtures** for complex test data using fixture classes
- **Test error conditions** and edge cases thoroughly

### Build Process
```bash

# Build both CommonJS and ES modules
pnpm run build

# Format source code
pnpm run format

# Lint source code
pnpm run lint
```

## Framework Architecture

### Core Concepts
- **Metadata handling** - framework uses reflection metadata
- **Lifecycle management** - supports component initialization and cleanup
- **Type safety** - provides type-safe APIs for dependency injection
- **Framework utilities** - common patterns for framework development

### Integration with Container
- Framework core works with the InversifyJS container system
- Provides higher-level abstractions over core container functionality
- Enables framework-specific features like lifecycle management

## Common Tasks

### Adding New Framework Features
1. **Design type-safe APIs** using TypeScript generics
2. **Implement core functionality** with proper error handling
3. **Write comprehensive unit tests** following testing guidelines
4. **Add integration tests** for component interactions
5. **Update documentation** and add usage examples

### Performance Considerations
- Framework core operations should be efficient
- Minimize metadata reflection overhead
- Cache computed values where appropriate
- Profile performance-critical paths

## Important Notes

### Breaking Changes
- Framework core changes affect all framework packages
- Coordinate with HTTP framework and other dependent packages
- Test thoroughly with real applications
- Provide migration guides for major changes

### Type Safety
- Framework APIs should be strongly typed
- Use generic constraints to enforce correct usage
- Provide clear compilation errors for misuse
- Avoid runtime type checking where compile-time checking suffices

### Testing Excellence
- Framework core requires **excellent test coverage**
- Test both happy path and error conditions
- Use fixture classes for reusable test data
- Follow the documented testing patterns consistently
