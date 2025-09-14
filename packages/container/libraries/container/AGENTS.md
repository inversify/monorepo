# AGENTS.md - @inversifyjs/container

## Package Overview

The `@inversifyjs/container` package provides the high-level container API and user-facing interfaces for the InversifyJS dependency injection system. It builds on `@inversifyjs/core` to provide a complete, easy-to-use container implementation.

## Key Responsibilities

- **Container API**: Main `Container` class and user-facing methods
- **Binding DSL**: Fluent API for configuring service bindings
- **Plugin Integration**: Supports the plugin system for extending functionality
- **User Experience**: Provides intuitive APIs for common DI scenarios
- **Snapshot Management**: Container state snapshots for testing and rollback

## Working with Container

### Key Characteristics
- **User-Facing API**: Focus on developer experience and ease of use
- **Type Safety**: Extensive TypeScript generics for compile-time safety
- **Plugin Support**: Integrates with the plugin system seamlessly
- **Performance**: Built on optimized core algorithms
- **Testing Support**: Snapshot functionality for test isolation

### Testing Strategy

#### Unit Testing Requirements
Follow the [structured testing approach](../../../../docs/testing/unit-testing.md):

1. **Class Scope**: Test Container class and binding builders
2. **Method Scope**: Test each public API method
3. **Input Scope**: Test various binding configurations and scenarios  
4. **Flow Scope**: Test different resolution paths and plugin interactions

#### Critical Test Areas
- **Binding API**: Test all binding methods and configurations
- **Resolution**: Test get(), resolve(), and related methods
- **Plugin Integration**: Test plugin lifecycle and interactions
- **Snapshot Functionality**: Test save/restore operations
- **Error Scenarios**: Test meaningful error messages
- **Type Safety**: Test TypeScript compilation and type inference

### Development Guidelines

#### API Design Principles
- **Intuitive Naming**: Method names should be self-explanatory
- **Consistent Patterns**: Similar operations should use similar APIs
- **Type Inference**: Minimize explicit type annotations where possible
- **Error Prevention**: Design APIs to prevent common mistakes
- **Backward Compatibility**: Maintain compatibility across versions

#### User Experience Focus
- **Clear Error Messages**: Provide actionable error information
- **Good Defaults**: Choose sensible defaults for common scenarios
- **Examples**: Provide clear usage examples in documentation

#### Plugin Integration
- **Plugin Lifecycle**: Properly integrate plugin hooks and events
- **Composability**: Ensure plugins work well together
- **Performance**: Minimize plugin overhead for core operations
- **Testing**: Test plugin interactions thoroughly

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

#### Consumers
- **Applications**: End-user applications using InversifyJS
- **@inversifyjs/plugin-dispose**: Disposal plugin
- **Framework Integrations**: Various framework-specific packages

### Common Development Tasks

#### Adding New Binding Methods
1. **Design the API**: Consider type safety and user experience
2. **Implement the Method**: Add to the binding interface
3. **Add Type Definitions**: Ensure proper TypeScript support
4. **Write Comprehensive Tests**: Cover all scenarios and edge cases
5. **Update Documentation**: Add JSDoc and usage examples

#### Enhancing Container Features
1. **Analyze User Needs**: Understand the use case and requirements
2. **Design the Interface**: Create intuitive and type-safe APIs
3. **Implement Core Logic**: Build on existing core functionality
4. **Add Plugin Support**: Consider plugin extension points
5. **Test Thoroughly**: Unit tests, integration tests, real-world scenarios

#### Improving Error Messages
1. **Identify Pain Points**: Common user errors and confusion
2. **Enhance Error Context**: Add more helpful information
3. **Provide Solutions**: Suggest how to fix the issue
4. **Test Error Scenarios**: Ensure messages are actually helpful
5. **Update Documentation**: Include troubleshooting guides

### Important Notes

#### Type Safety Best Practices
- Use service identifiers with strong typing
- Leverage generic constraints for better compile-time checks
- Provide clear type definitions for complex binding scenarios
- Test TypeScript compilation in CI/CD pipeline

#### Performance Considerations
- Container operations should be fast for user-facing scenarios
- Binding configuration is typically done at startup, so optimization focus is on resolution
- Use core caching mechanisms effectively
- Monitor memory usage for long-running applications

#### Plugin Compatibility
- Ensure new features work with existing plugins
- Test plugin combinations thoroughly
- Provide migration guides for breaking changes
- Document plugin interaction patterns

#### User Migration
- Maintain backward compatibility where possible
- Provide clear migration guides for breaking changes
- Support gradual migration patterns
- Test with real-world applications before releases
