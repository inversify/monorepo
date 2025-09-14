# AGENTS.md - @inversifyjs/strongly-typed

## Package Overview

The `@inversifyjs/strongly-typed` package provides enhanced type safety and compile-time guarantees for InversifyJS containers. It leverages advanced TypeScript features to ensure that dependency injection is type-safe, reducing runtime errors and improving the developer experience.

## Key Responsibilities

- **Type Safety**: Compile-time type checking for container operations
- **Strong Typing Utilities**: Advanced TypeScript patterns for DI
- **Type-Safe Service Identifiers**: Branded types and symbols for services
- **Container Type Extensions**: Enhanced typing for container methods
- **Inference Helpers**: Utilities to improve TypeScript type inference

## Working with Strong Typing

### Key Characteristics
- **Type-Only Package**: Primarily provides type definitions and utilities
- **Peer Dependency**: Works with inversify as a peer dependency
- **Advanced TypeScript**: Uses cutting-edge TypeScript features
- **Zero Runtime**: No runtime dependencies or code
- **Compilation-Heavy**: Focuses on TypeScript compilation and type checking

### Testing Strategy

#### Type Testing Requirements
Since this is a type-focused package, testing emphasizes TypeScript compilation:

1. **Type Tests** (`*.spec-d.ts`): Test TypeScript type checking with `tsd` or similar
2. **Compilation Tests**: Verify that expected patterns compile correctly
3. **Error Tests**: Verify that incorrect usage produces compilation errors
4. **Inference Tests**: Test that TypeScript correctly infers types

#### Critical Test Areas
- **Service Identifier Types**: Test that service identifiers are properly typed
- **Container Method Types**: Test type safety of get(), bind(), etc.
- **Generic Constraints**: Test that generic constraints work correctly
- **Type Inference**: Test that TypeScript can infer types properly
- **Error Scenarios**: Test that type errors are caught at compile time

### Development Guidelines

#### TypeScript Best Practices
- **Latest Features**: Use cutting-edge TypeScript features for better types
- **Generic Constraints**: Proper use of generic constraints for type safety
- **Mapped Types**: Leverage mapped types for complex transformations
- **Conditional Types**: Use conditional types for type-level logic
- **Template Literal Types**: Use for string manipulation at type level

#### Type Safety Patterns
- **Branded Types**: Use branded types to prevent type confusion
- **Phantom Types**: Use phantom types for additional type information
- **Type Guards**: Provide type guard functions where useful
- **Assertion Functions**: Use assertion functions for runtime type checking
- **Const Assertions**: Leverage const assertions for literal types

#### API Design
- **Intuitive Types**: Types should feel natural to TypeScript developers
- **Error Messages**: Provide helpful error messages for type mismatches
- **IntelliSense**: Optimize for excellent IDE support and autocomplete
- **Backwards Compatibility**: Maintain type compatibility across versions

### Build and Test Commands

```bash
# Build the package
pnpm run build

# Run type tests
pnpm run test

# Run only unit tests (if any)
pnpm run test:unit

# Run only integration tests
pnpm run test:integration

# Generate coverage report
pnpm run test:coverage

# Format code
pnpm run format

# Lint code  
pnpm run lint
```

### Strong Typing Examples

#### Type-Safe Service Identifiers
```typescript
import { ServiceIdentifier, Container } from '@inversifyjs/strongly-typed';

// Branded service identifier
const USER_SERVICE = Symbol('UserService') as ServiceIdentifier<UserService>;
const LOGGER = Symbol('Logger') as ServiceIdentifier<Logger>;

const container = new Container();

// Type-safe binding
container.bind(USER_SERVICE).to(UserServiceImpl);
container.bind(LOGGER).toConstant(new ConsoleLogger());

// Type-safe resolution - TypeScript knows the return type
const userService: UserService = container.get(USER_SERVICE);
const logger: Logger = container.get(LOGGER);
```

#### Advanced Type Constraints
```typescript
// Generic constraints for type safety
interface Repository<T> {
  save(entity: T): Promise<void>;
  findById(id: string): Promise<T | null>;
}

// Type-safe repository binding
function bindRepository<T>(
  container: Container,
  identifier: ServiceIdentifier<Repository<T>>,
  implementation: Constructor<Repository<T>>
): void {
  container.bind(identifier).to(implementation);
}

// Usage with compile-time type checking
bindRepository(container, USER_REPOSITORY, UserRepository);
bindRepository(container, PRODUCT_REPOSITORY, ProductRepository);
```

#### Type-Safe Factory Patterns
```typescript
// Strongly typed factory
type Factory<T, TArgs extends readonly unknown[] = []> = (...args: TArgs) => T;

// Type-safe factory binding
container.bind<Factory<Database, [string]>>('DatabaseFactory')
  .toFactory<Database, [string]>((context) => {
    return (connectionString: string) => {
      return new Database(connectionString);
    };
  });

// Type-safe factory usage
const dbFactory = container.get<Factory<Database, [string]>>('DatabaseFactory');
const db: Database = dbFactory('connection-string'); // TypeScript knows the type
```

### Common Development Tasks

#### Adding New Type Utilities
1. **Identify Type Needs**: Understand what type utilities are needed
2. **Design Type Logic**: Create TypeScript type-level logic
3. **Implement Types**: Write advanced TypeScript type definitions
4. **Add Type Tests**: Test compilation and type inference
5. **Document Usage**: Provide clear examples and documentation

#### Enhancing Type Safety
1. **Analyze Weak Points**: Find areas where type safety could improve
2. **Design Better Types**: Create more restrictive and helpful types
3. **Implement Constraints**: Add generic constraints and type guards
4. **Test Type Checking**: Verify that errors are caught at compile time
5. **Benchmark Compilation**: Ensure types don't slow compilation too much

#### Improving Developer Experience
1. **Analyze IDE Support**: Test IntelliSense and autocomplete behavior
2. **Optimize Type Definitions**: Improve type inference and suggestions
3. **Add Helper Types**: Create utilities that make common patterns easier
4. **Enhance Error Messages**: Improve TypeScript error messages
5. **Create Examples**: Provide comprehensive usage examples

### Important Patterns

#### Branded Service Identifiers
```typescript
// Branded type for service identifiers
export type ServiceIdentifier<T> = symbol & { readonly __serviceType: T };

// Helper to create branded identifiers
export function createServiceIdentifier<T>(description?: string): ServiceIdentifier<T> {
  return Symbol(description) as ServiceIdentifier<T>;
}

// Usage
const USER_SERVICE = createServiceIdentifier<UserService>('UserService');
```

#### Type-Safe Container Extensions
```typescript
// Enhanced container with better typing
export interface StronglyTypedContainer {
  bind<T>(serviceIdentifier: ServiceIdentifier<T>): BindingToSyntax<T>;
  get<T>(serviceIdentifier: ServiceIdentifier<T>): T;
  getAll<T>(serviceIdentifier: ServiceIdentifier<T>): T[];
  resolve<T>(constructorFunction: Constructor<T>): T;
}
```

#### Advanced Generic Constraints
```typescript
// Type constraints for dependency injection
export type Injectable<T = {}> = Constructor<T> | Factory<T>;
export type Constructor<T = {}> = new (...args: any[]) => T;
export type Factory<T = {}> = (...args: any[]) => T;

// Constraint for bindable types
export type Bindable<T> = Injectable<T> | T | Promise<T>;
```

### Important Notes

#### TypeScript Version Requirements
- **Minimum Version**: Requires recent TypeScript version for advanced features
- **Feature Dependencies**: Uses conditional types, mapped types, template literals
- **Compilation Target**: May require specific TypeScript compilation settings
- **IDE Support**: Best experience with VS Code and TypeScript extensions

#### Performance Considerations
- **Compilation Speed**: Complex types can slow TypeScript compilation
- **Type Checking**: Extensive type checking may increase build times
- **Memory Usage**: Complex type operations can use significant memory
- **Bundle Size**: Should have zero impact on runtime bundle size

#### Compatibility
- **InversifyJS Versions**: Maintain compatibility with target inversify versions
- **TypeScript Evolution**: Adapt to new TypeScript features and changes
- **Breaking Changes**: Type changes can break consuming code
- **Migration Support**: Provide type migration guides for major changes

#### Common Pitfalls
- **Over-Engineering**: Avoid overly complex types that hurt usability
- **Type Performance**: Monitor TypeScript compilation performance
- **Error Messages**: Ensure type errors are understandable
- **Learning Curve**: Advanced types can be intimidating for new users

#### Testing Strategy
- **Type-Only Tests**: Use tools like `tsd` for type testing
- **Compilation Tests**: Verify expected code compiles correctly
- **Error Tests**: Verify incorrect code produces compilation errors
- **Integration Tests**: Test with real-world usage patterns
- **Performance Tests**: Monitor TypeScript compilation performance
