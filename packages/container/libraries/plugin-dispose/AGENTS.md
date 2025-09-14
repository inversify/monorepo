# AGENTS.md - @inversifyjs/plugin-dispose

## Package Overview

The `@inversifyjs/plugin-dispose` package provides automatic resource disposal and cleanup functionality for InversifyJS containers. It implements the plugin interface to add lifecycle management capabilities, ensuring that resources are properly disposed of when containers are torn down or services are no longer needed.

## Key Responsibilities

- **Resource Disposal**: Automatic cleanup of disposable resources
- **Lifecycle Management**: Tracks service lifecycle for proper disposal timing
- **Plugin Implementation**: Implements the plugin interface for container integration
- **Disposal Patterns**: Supports various disposal patterns (IDisposable, async disposal, etc.)
- **Memory Management**: Prevents memory leaks through proper resource cleanup

## Package Structure

### Core Components
- **Dispose Plugin**: Main plugin implementation for disposal functionality
- **Disposal Tracking**: Tracks disposable instances and their disposal status
- **Disposal Strategies**: Different strategies for disposing various resource types
- **Lifecycle Hooks**: Integration with container lifecycle events
- **Error Handling**: Robust error handling during disposal operations

### Design Philosophy
- **Automatic Cleanup**: Resources should be cleaned up automatically when possible
- **Fail-Safe**: Disposal errors should not crash the application
- **Configurable**: Different disposal strategies for different scenarios
- **Performance**: Minimal overhead for non-disposable services
- **Composable**: Works well with other plugins

## Working with Plugin Dispose

### Key Characteristics
- **Plugin Implementation**: Implements `@inversifyjs/plugin` interface
- **Resource Management**: Focus on memory and resource cleanup
- **Lifecycle Aware**: Understands container and service lifecycles
- **Error Resilient**: Handles disposal errors gracefully
- **Comprehensive Testing**: Requires thorough testing of disposal scenarios

### Testing Strategy

#### Unit Testing Requirements
Follow the [structured testing approach](../../../../docs/testing/unit-testing.md):

1. **Class Scope**: Test disposal plugin and disposal tracking classes
2. **Method Scope**: Test disposal methods and lifecycle hooks
3. **Input Scope**: Test various disposable resource types and scenarios
4. **Flow Scope**: Test different disposal timing and error conditions

#### Critical Test Areas
- **Disposal Execution**: Test that disposable resources are actually disposed
- **Lifecycle Integration**: Test proper integration with container lifecycle
- **Error Handling**: Test disposal error scenarios and recovery
- **Memory Leaks**: Test that disposal prevents memory leaks
- **Plugin Composition**: Test interaction with other plugins
- **Async Disposal**: Test asynchronous disposal patterns

### Development Guidelines

#### Disposal Patterns
- **IDisposable Interface**: Support standard disposable patterns
- **Async Disposal**: Handle asynchronous cleanup operations
- **Disposal Ordering**: Ensure proper disposal order for dependent resources
- **Error Isolation**: Prevent one disposal failure from affecting others
- **Resource Tracking**: Track disposable resources throughout their lifecycle

#### Error Handling Strategies
- **Graceful Degradation**: Continue operation even if some disposals fail
- **Error Logging**: Log disposal errors for debugging
- **Timeout Handling**: Handle slow or hanging disposal operations
- **Recovery Mechanisms**: Provide fallback disposal strategies

#### Performance Considerations
- **Minimal Overhead**: Don't slow down non-disposable service resolution
- **Efficient Tracking**: Use efficient data structures for tracking disposables
- **Batch Disposal**: Optimize disposal of multiple resources
- **Memory Usage**: Minimize memory overhead of disposal tracking

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

### Integration Points

#### Dependencies
- **@inversifyjs/container**: Container implementation for integration
- **@inversifyjs/plugin**: Plugin interface implementation

#### Peer Dependencies
- **inversify**: Main inversify package for integration

#### Consumers
- **Applications**: Applications that need automatic resource cleanup
- **Framework Integrations**: Frameworks that provide resource management

### Common Development Tasks

#### Adding New Disposal Patterns
1. **Identify Pattern**: Understand the new disposal pattern requirements
2. **Design Strategy**: Create disposal strategy for the pattern
3. **Implement Handler**: Add disposal logic for the pattern
4. **Add Type Support**: Ensure TypeScript support for the pattern
5. **Write Tests**: Comprehensive tests for the new pattern
6. **Update Documentation**: Document usage and best practices

#### Improving Error Handling
1. **Analyze Failure Modes**: Understand how disposals can fail
2. **Design Recovery**: Create strategies for handling failures
3. **Implement Fallbacks**: Add fallback disposal mechanisms
4. **Add Logging**: Improve error reporting and debugging
5. **Test Scenarios**: Test various error conditions thoroughly

#### Optimizing Performance
1. **Profile Disposal**: Identify performance bottlenecks in disposal
2. **Optimize Tracking**: Improve efficiency of disposable tracking
3. **Batch Operations**: Optimize disposal of multiple resources
4. **Reduce Overhead**: Minimize impact on non-disposable services
5. **Benchmark Results**: Verify performance improvements

### Important Patterns

#### Disposal Lifecycle
```typescript
class DisposalTracker {
  private disposables = new WeakMap<object, DisposalInfo>();
  
  track(instance: any, disposalMethod: () => void): void {
    this.disposables.set(instance, {
      dispose: disposalMethod,
      disposed: false,
      timestamp: Date.now()
    });
  }
  
  dispose(instance: any): void {
    const info = this.disposables.get(instance);
    if (info && !info.disposed) {
      try {
        info.dispose();
        info.disposed = true;
      } catch (error) {
        this.handleDisposalError(error, instance);
      }
    }
  }
}
```

#### Error Resilient Disposal
```typescript
class ResilientDisposer {
  async disposeAll(disposables: Disposable[]): Promise<void> {
    const results = await Promise.allSettled(
      disposables.map(d => this.safeDispose(d))
    );
    
    const failures = results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason);
    
    if (failures.length > 0) {
      this.handleDisposalFailures(failures);
    }
  }
}
```

### Important Notes

#### Memory Management
- **Weak References**: Use WeakMap for tracking to avoid memory leaks
- **Cleanup Timing**: Dispose resources at appropriate lifecycle points
- **Circular References**: Handle circular references in disposable objects
- **Resource Monitoring**: Monitor for resource leaks in testing

#### Plugin Integration
- **Hook Priority**: Ensure disposal hooks run at the right time
- **Plugin Ordering**: Consider order dependencies with other plugins
- **State Management**: Maintain plugin state correctly across lifecycle
- **Configuration**: Provide configurable disposal behaviors

#### Error Handling
- **Disposal Failures**: Handle individual disposal failures gracefully
- **Timeout Management**: Prevent hanging on slow disposal operations
- **Error Reporting**: Provide useful error information for debugging
- **Recovery Strategies**: Implement fallback disposal mechanisms

#### Testing Considerations
- **Memory Leak Testing**: Verify that disposal prevents memory leaks
- **Async Testing**: Test asynchronous disposal patterns thoroughly
- **Error Scenarios**: Test various disposal failure conditions
- **Integration Testing**: Test with real resources and containers

#### Performance Impact
- **Tracking Overhead**: Minimize overhead of tracking disposables
- **Disposal Speed**: Optimize disposal operations for performance
- **Memory Usage**: Keep disposal tracking memory usage minimal
- **Batch Efficiency**: Optimize batch disposal operations
