# AGENTS.md - @inversifyjs/core

## Package Overview

The `@inversifyjs/core` package is the foundational layer of the InversifyJS dependency injection system. It contains the core planning algorithms, resolution logic, and fundamental architecture patterns that power the entire container ecosystem.

## Key Responsibilities

- **Planning Phase**: Builds execution plans for dependency resolution
- **Resolution Logic**: Core algorithms for creating and injecting dependencies  
- **Metadata Management**: Handles reflection metadata and binding information
- **Error Handling**: Provides detailed error reporting with context
- **Symbol Management**: Manages service identifiers and injection tokens

## Architecture Patterns

### Planning Phase
The core implements a two-phase resolution strategy:

1. **Plan Creation**: Analyzes dependency graph and creates execution plan
2. **Plan Execution**: Executes the plan to create actual instances

This separation enables:
- **Caching**: Plans can be cached for performance
- **Validation**: Dependencies can be validated before execution
- **Debugging**: Clear separation of concerns for troubleshooting

### Resolution Phase  
The resolution system follows these patterns:

- **Request/Context Pattern**: Each resolution maintains context state
- **Factory Pattern**: Different activation strategies for different binding types
- **Chain of Responsibility**: Multiple resolvers handle different scenarios

### Error Reporting
Core provides comprehensive error reporting:
- **Service Identifier Context**: Errors include which service failed
- **Binding Information**: Details about how services are bound
- **Resolution Stack**: Shows the dependency chain that led to errors

## Working with Core

### Key Characteristics
- **Performance Critical**: Operations happen frequently at runtime
- **Type Safety**: Heavy use of TypeScript generics and constraints  
- **Immutable Patterns**: Core data structures are immutable where possible
- **Comprehensive Testing**: Requires extensive unit and integration tests

### Testing Strategy

#### Unit Testing Requirements
Follow the [four-layer testing structure](../../../../docs/testing/unit-testing.md):

1. **Class Scope**: Test each planner, resolver, and metadata handler
2. **Method Scope**: Test each public method thoroughly
3. **Input Scope**: Test various dependency configurations
4. **Flow Scope**: Test different resolution paths and error conditions

#### Critical Test Areas
- **Planning Algorithm**: Test plan generation for complex dependency graphs
- **Resolution Logic**: Test actual object creation and injection
- **Error Scenarios**: Test circular dependencies, missing bindings, etc.
- **Performance**: Test plan caching and resolution performance
- **Metadata Handling**: Test reflection metadata processing

### Development Guidelines

#### Performance Considerations
- **Hot Path Optimization**: Resolution happens frequently - optimize for speed
- **Memory Management**: Minimize allocations in planning and resolution
- **Plan Caching**: Ensure plans are properly cached and invalidated
- **Object Pooling**: Consider pooling for frequently created objects

#### Type Safety Patterns
- **Generic Constraints**: Use TypeScript constraints to enforce correct usage
- **Branded Types**: Use branded types for service identifiers
- **Mapped Types**: Leverage mapped types for complex binding scenarios
- **Conditional Types**: Use conditional types for resolution logic

#### Error Handling Best Practices
- **Contextual Errors**: Include service identifiers and binding info
- **User-Friendly Messages**: Provide clear guidance on how to fix issues
- **Error Recovery**: Where possible, provide suggestions for resolution
- **Stack Preservation**: Maintain error stacks for debugging

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

#### Adding New Planning Logic
1. **Design the Algorithm**: Consider performance and correctness
2. **Implement the Planner**: Add to the planning module
3. **Add Comprehensive Tests**: Test all edge cases and performance
4. **Update Integration Tests**: Ensure it works with the full container
5. **Benchmark Performance**: Verify no performance regressions

#### Extending Resolution Strategies
1. **Define the Strategy Interface**: Add to resolution types
2. **Implement the Resolver**: Add resolution logic
3. **Update the Factory**: Integrate with the resolution factory
4. **Test Thoroughly**: Unit tests, integration tests, error scenarios
5. **Document Usage**: Update documentation and examples

#### Optimizing Performance
1. **Profile Current Performance**: Use container benchmarks
2. **Identify Bottlenecks**: Focus on hot paths in planning/resolution
3. **Implement Optimizations**: Make targeted improvements
4. **Verify Improvements**: Re-run benchmarks to confirm gains
5. **Test Correctness**: Ensure optimizations don't break functionality

### Important Notes

#### Breaking Changes
- Core changes affect the entire container ecosystem
- Coordinate with all consuming packages before making changes
- Provide migration guides for major API changes
- Test with real-world applications

#### Debugging Guidelines
- Use the planning system to understand resolution flow
- Check binding metadata and constraints
- Verify service identifier resolution
- Use comprehensive error messages for troubleshooting
