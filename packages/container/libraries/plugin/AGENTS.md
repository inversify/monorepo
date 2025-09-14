# AGENTS.md - @inversifyjs/plugin

## Package Overview

The `@inversifyjs/plugin` package provides the plugin system interface and base functionality for extending InversifyJS containers. It defines the plugin architecture that allows developers to add custom functionality to the container lifecycle without modifying core container code.

## Key Responsibilities

- **Plugin Interface**: Defines the contract that all plugins must implement
- **Plugin Lifecycle**: Manages plugin activation, execution, and deactivation
- **Hook System**: Provides extension points throughout container operations
- **Plugin Composition**: Enables multiple plugins to work together seamlessly
- **Base Implementations**: Common plugin patterns and utilities

## Working with Plugin System

### Key Characteristics
- **Interface-Only Package**: Primarily provides interfaces and type definitions
- **No Tests**: This package typically has no test files since it's interface-only
- **Minimal Dependencies**: Only depends on core for basic types
- **Extension Point**: Other packages implement the actual plugin functionality
- **Type-Heavy**: Extensive use of TypeScript for plugin contracts

### Plugin Architecture

#### Plugin Interface
```typescript
interface Plugin {
  name: string;
  version: string;
  activate(context: PluginContext): void | Promise<void>;
  deactivate?(context: PluginContext): void | Promise<void>;
}
```

#### Hook System
Plugins can hook into various container lifecycle events:
- **beforeBinding**: Before a service is bound to the container
- **afterBinding**: After a service is bound to the container
- **beforeResolution**: Before a service is resolved
- **afterResolution**: After a service is resolved
- **onError**: When an error occurs during container operations

#### Plugin Context
Provides plugins with access to:
- Container instance
- Current operation context
- Plugin configuration
- Inter-plugin communication

### Development Guidelines

#### Plugin Interface Design
- **Clear Contracts**: Plugin interfaces should be well-defined and documented
- **Async Support**: Support both synchronous and asynchronous plugin operations
- **Error Handling**: Define how plugin errors should be handled
- **Lifecycle Management**: Clear activation and deactivation patterns
- **Version Compatibility**: Support for plugin version checking

#### Type Safety Patterns
- **Generic Plugin Types**: Use generics for type-safe plugin configuration
- **Hook Type Safety**: Ensure hook parameters are properly typed
- **Plugin Metadata**: Type-safe plugin metadata and configuration
- **Context Types**: Strong typing for plugin execution context

#### Performance Considerations
- **Lazy Loading**: Plugins should only be loaded when needed
- **Hook Overhead**: Minimize performance impact of hook system
- **Plugin Isolation**: Prevent one plugin from affecting others' performance
- **Caching**: Support caching of plugin results where appropriate

### Build Commands

```bash
# Build the package (interfaces only)
pnpm run build

# Format code
pnpm run format

# Lint code
pnpm run lint
```

Note: This package typically does not have tests since it primarily provides interfaces.

### Plugin Development Examples

#### Basic Plugin Implementation
```typescript
import { Plugin, PluginContext } from '@inversifyjs/plugin';

export class LoggingPlugin implements Plugin {
  public readonly name = 'LoggingPlugin';
  public readonly version = '1.0.0';

  public activate(context: PluginContext): void {
    context.container.onResolution((binding, resolved) => {
      console.log(`Resolved ${binding.serviceIdentifier} -> ${resolved}`);
    });
  }

  public deactivate?(context: PluginContext): void {
    // Cleanup logging hooks
  }
}
```

#### Advanced Plugin with Hooks
```typescript
export class MetricsPlugin implements Plugin {
  public readonly name = 'MetricsPlugin';
  public readonly version = '2.1.0';

  private metrics: MetricsCollector;

  public activate(context: PluginContext): void {
    this.metrics = new MetricsCollector();

    context.hooks.beforeResolution.tap('MetricsPlugin', (request) => {
      this.metrics.startTimer(request.serviceIdentifier);
    });

    context.hooks.afterResolution.tap('MetricsPlugin', (request, result) => {
      this.metrics.endTimer(request.serviceIdentifier);
      this.metrics.recordResolution(request.serviceIdentifier, result);
    });

    context.hooks.onError.tap('MetricsPlugin', (error) => {
      this.metrics.recordError(error);
    });
  }
}
```

### Common Development Tasks

#### Defining New Plugin Interfaces
1. **Analyze Requirements**: Understand what functionality needs to be pluggable
2. **Design Interface**: Create clear, focused plugin interfaces
3. **Define Hooks**: Identify extension points where plugins can inject behavior
4. **Add Type Definitions**: Ensure proper TypeScript support
5. **Document Usage**: Provide clear examples and best practices

#### Adding New Hook Points
1. **Identify Extension Need**: Determine where new extension points are needed
2. **Design Hook Interface**: Create consistent hook signatures
3. **Update Plugin Context**: Add new hooks to plugin context
4. **Version Compatibility**: Ensure backward compatibility
5. **Update Documentation**: Document new extension capabilities

#### Evolving Plugin Architecture
1. **Gather Feedback**: Understand pain points in current plugin system
2. **Design Improvements**: Create better abstractions and patterns
3. **Maintain Compatibility**: Ensure existing plugins continue to work
4. **Migration Support**: Provide clear migration paths
5. **Performance Testing**: Verify improvements don't degrade performance

### Important Notes

#### Interface-Only Nature
- This package primarily provides TypeScript interfaces and type definitions
- Actual plugin functionality is implemented in consuming packages
- No runtime logic or business functionality should be in this package
- Focus on clear, well-documented contracts

#### Version Compatibility
- Plugin interface changes can break existing plugins
- Use semantic versioning carefully for interface changes
- Provide deprecation warnings for interface changes
- Support multiple interface versions when possible

#### Performance Impact
- Plugin system should have minimal overhead when no plugins are loaded
- Hook execution should be optimized for common cases
- Plugin registration and management should be efficient
- Consider lazy loading and caching strategies

#### Plugin Ecosystem
- Design interfaces to encourage a healthy plugin ecosystem
- Provide examples and templates for common plugin patterns
- Document best practices for plugin development
- Consider plugin discovery and registry mechanisms

#### Testing Strategy
Since this is an interface-only package:
- Focus on TypeScript compilation tests
- Test interface compatibility across versions
- Provide reference implementations for testing
- Document testing patterns for plugin implementers

#### Future Evolution
- Consider standardization with other DI frameworks
- Plan for potential decorator-based plugin registration
- Think about plugin composition and dependency management
- Consider runtime plugin loading and hot reloading capabilities
