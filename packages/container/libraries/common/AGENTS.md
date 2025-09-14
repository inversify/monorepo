# AGENTS.md - @inversifyjs/common

## Package Overview

The `@inversifyjs/common` package provides shared utilities, types, and constants used across the entire InversifyJS container ecosystem. It serves as the foundation layer that other packages build upon, ensuring consistency and avoiding code duplication.

## Key Responsibilities

- **Shared Types**: Common interfaces and type definitions
- **Utility Functions**: Helper functions used across multiple packages
- **Constants**: Shared constants and enumerations
- **Base Interfaces**: Core abstractions that other packages implement
- **Error Types**: Common error classes and error handling utilities

## Working with Common

### Key Characteristics
- **Foundation Package**: Other packages depend on this one
- **Stable API**: Breaking changes affect the entire ecosystem
- **Utility Focus**: Provides tools, not business logic
- **Type-Heavy**: Extensive use of TypeScript features
- **Well-Tested**: Changes require comprehensive testing

### Testing Strategy

#### Unit Testing Requirements
Follow the [structured testing approach](../../../../docs/testing/unit-testing.md):

1. **Class Scope**: Test each utility class and error type
2. **Method Scope**: Test each utility function thoroughly  
3. **Input Scope**: Test various input scenarios and edge cases
4. **Flow Scope**: Test different execution paths and error conditions

#### Critical Test Areas
- **Utility Functions**: Test all helper functions with various inputs
- **Type Definitions**: Test TypeScript compilation and type inference
- **Error Classes**: Test error creation and message formatting
- **Constants**: Verify constant values and types
- **Edge Cases**: Test boundary conditions and error scenarios

### Development Guidelines

#### Stability Requirements
- **Backward Compatibility**: Maintain API compatibility across versions
- **Deprecation Process**: Follow proper deprecation for removed features
- **Impact Analysis**: Consider effects on all consuming packages
- **Migration Support**: Provide clear migration paths for changes

#### Code Quality Standards
- **Pure Functions**: Utilities should be pure functions where possible
- **Immutability**: Prefer immutable patterns and data structures
- **Performance**: Optimize for common use cases
- **Documentation**: Comprehensive JSDoc for all public APIs

#### Type Safety Practices
- **Strict Types**: Use strict TypeScript settings
- **Generic Constraints**: Proper generic type constraints
- **Type Guards**: Provide type guard functions where useful
- **Branded Types**: Use branded types for domain-specific values

### Build and Test Commands

```bash
# Build the package
pnpm run build

# Run all tests
pnpm run test

# Run only unit tests
pnpm run test:unit

# Run only integration tests
pnpm run test:integration

# Generate coverage report
pnpm run test:coverage
```

### Common Development Tasks

#### Adding New Utility Functions
1. **Identify Need**: Ensure utility is needed by multiple packages
2. **Design Interface**: Create clean, reusable API
3. **Implement Function**: Write pure, well-documented function
4. **Add Comprehensive Tests**: Cover all scenarios and edge cases
5. **Update Type Definitions**: Ensure proper TypeScript support

#### Adding New Types
1. **Analyze Requirements**: Understand what types are needed
2. **Design Type Hierarchy**: Create logical, extensible type structure
3. **Define Interfaces**: Write clear, well-documented interfaces
4. **Add Type Tests**: Test TypeScript compilation and inference
5. **Update Documentation**: Document usage patterns and examples

#### Refactoring Shared Code
1. **Identify Duplicated Code**: Find code repeated across packages
2. **Extract Common Logic**: Move shared logic to common package
3. **Design Generic Interface**: Create reusable abstraction
4. **Update All Consumers**: Migrate packages to use common code
5. **Test Integration**: Verify all packages work correctly

### Important Patterns

#### Error Handling
```typescript
// Base error class for consistent error handling
export abstract class InversifyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Specific error types
export class CircularDependencyError extends InversifyError {
  constructor(serviceIdentifier: string) {
    super(`Circular dependency detected for service: ${serviceIdentifier}`);
  }
}
```

#### Utility Functions
```typescript
// Type-safe utility functions
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

#### Type Definitions
```typescript
// Shared interfaces
export interface ServiceIdentifier<T = any> {
  readonly name?: string;
  readonly value: string | symbol | Function;
}

// Generic type constraints
export type Constructor<T = {}> = new (...args: any[]) => T;
```

### Important Notes

#### Breaking Changes
- **Ecosystem Impact**: Changes affect all packages in the monorepo
- **Version Coordination**: Coordinate major version bumps across packages
- **Migration Planning**: Provide comprehensive migration guides
- **Testing**: Test changes against all consuming packages

#### Performance Considerations
- **Hot Path Functions**: Utilities may be called frequently
- **Memory Usage**: Minimize memory allocations in utilities
- **Bundle Size**: Consider impact on final bundle size
- **Tree Shaking**: Ensure utilities are tree-shakable

#### Maintenance Guidelines
- **Regular Reviews**: Periodically review for outdated utilities
- **Deprecation**: Properly deprecate unused functions
- **Documentation**: Keep documentation up to date
- **Dependencies**: Avoid adding new dependencies unless absolutely necessary

#### Quality Assurance
- **High Test Coverage**: Aim for near 100% coverage
- **Type Safety**: Test TypeScript compilation thoroughly
- **Cross-Package Testing**: Test integration with consuming packages
- **Performance Testing**: Benchmark critical utility functions
