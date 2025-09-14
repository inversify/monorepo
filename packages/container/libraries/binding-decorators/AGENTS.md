# AGENTS.md - @inversifyjs/binding-decorators

## Package Overview

The `@inversifyjs/binding-decorators` package provides decorator-based binding configuration for InversifyJS. It enables developers to configure dependency injection through TypeScript decorators, offering a declarative alternative to programmatic container configuration.

## Key Responsibilities

- **Decorator Implementation**: Provides decorators for various binding scenarios
- **Metadata Management**: Stores and retrieves binding metadata from decorated classes
- **Reflection Integration**: Works with reflect-metadata for design-time type information
- **Binding Translation**: Converts decorator metadata into container bindings
- **Type Safety**: Maintains strong TypeScript support for decorated classes

## Working with Binding Decorators

### Key Characteristics
- **Decorator-Heavy**: Extensive use of TypeScript decorators
- **Reflection Dependent**: Requires reflect-metadata polyfill
- **Type Information**: Relies on TypeScript's emitted metadata
- **Peer Dependency**: Works with inversify container as peer dependency
- **Compile-Time Configuration**: Decorators are processed at compilation

### Testing Strategy

#### Unit Testing Requirements
Follow the [structured testing approach](../../../../docs/testing/unit-testing.md):

1. **Class Scope**: Test each decorator function and metadata processor
2. **Method Scope**: Test decorator application and metadata extraction
3. **Input Scope**: Test various decorator parameter combinations
4. **Flow Scope**: Test different decoration scenarios and edge cases

#### Critical Test Areas
- **Decorator Application**: Test that decorators properly set metadata
- **Metadata Extraction**: Test that metadata can be correctly retrieved
- **Type Reflection**: Test integration with TypeScript's type emission
- **Container Integration**: Test that decorated classes work with container
- **Error Scenarios**: Test invalid decorator usage and helpful error messages
- **Compilation**: Test TypeScript compilation with various decorator configurations

### Development Guidelines

#### Decorator Design Principles
- **Intuitive Naming**: Decorator names should clearly indicate their purpose
- **Composable**: Decorators should work well together
- **Type Safe**: Decorators should preserve and enhance type information
- **Runtime Safe**: Graceful handling when reflection metadata is missing
- **Consistent API**: Similar decorators should have similar signatures

#### Metadata Management
- **Metadata Keys**: Use consistent, namespaced metadata keys
- **Data Structures**: Design efficient metadata storage formats
- **Inheritance**: Handle decorator inheritance correctly
- **Performance**: Minimize metadata lookup overhead

#### TypeScript Integration
- **experimentalDecorators**: Requires experimental decorator support
- **emitDecoratorMetadata**: Needs decorator metadata emission
- **Type Preservation**: Maintain type information through decoration
- **Generic Support**: Handle generic classes and methods correctly

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

#### Adding New Decorators
1. **Design the API**: Consider use cases and parameter requirements
2. **Implement Decorator**: Create decorator function with proper typing
3. **Add Metadata Logic**: Define how decorator information is stored
4. **Create Type Definitions**: Ensure proper TypeScript support
5. **Write Comprehensive Tests**: Cover all scenarios and integrations
6. **Update Documentation**: Add usage examples and best practices

#### Enhancing Metadata Processing
1. **Analyze Requirements**: Understand what metadata is needed
2. **Design Storage Format**: Create efficient metadata structures
3. **Implement Processors**: Add logic to extract and transform metadata
4. **Test Extraction Logic**: Verify metadata is correctly processed
5. **Benchmark Performance**: Ensure acceptable metadata lookup speed

#### Improving Type Safety
1. **Identify Type Issues**: Find areas where type information is lost
2. **Enhance Type Definitions**: Improve decorator type signatures
3. **Add Generic Constraints**: Use constraints for better type checking
4. **Test TypeScript Compilation**: Verify types work correctly
5. **Update Examples**: Show best practices for type safety

### Important Notes

#### TypeScript Configuration
Requires specific TypeScript compiler options:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

#### Runtime Requirements
- **reflect-metadata**: Must be imported before using decorators
- **Container Configuration**: Decorated classes must still be bound to container
- **Metadata Availability**: Graceful degradation when metadata is missing

#### Performance Considerations
- **Metadata Lookup**: Cache metadata where possible
- **Decorator Overhead**: Minimize runtime overhead of decorators
- **Bundle Size**: Consider impact on application bundle size
- **Tree Shaking**: Ensure unused decorators can be tree-shaken

#### Common Pitfalls
- **Missing reflect-metadata**: Ensure polyfill is properly loaded
- **Circular Dependencies**: Decorators don't prevent circular dependency issues
- **Generic Type Erasure**: TypeScript generic information is not available at runtime
- **Inheritance**: Decorator inheritance can be complex with class hierarchies

#### Migration and Compatibility
- **Inversify Version**: Maintain compatibility with target inversify versions
- **Decorator Standard**: Consider future TypeScript decorator changes
- **Breaking Changes**: Coordinate with container package for major changes
- **Legacy Support**: Provide migration paths for older decorator patterns
