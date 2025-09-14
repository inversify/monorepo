# AGENTS.md - Container Examples

## Package Overview

This directory contains example packages that demonstrate how to use the InversifyJS container libraries. These are **demonstration packages**, not libraries for consumption.

## Working with Example Packages

### Key Characteristics
- **No tests required** - examples are meant to be read and understood
- **Demonstration code** - shows usage patterns, not library implementation
- **Buildable packages** - examples should compile successfully
- **Dependencies on workspace packages** - examples use local workspace dependencies

### Development Guidelines

#### Purpose of Examples
1. **Educational** - teach developers how to use InversifyJS features
2. **Reference implementations** - show best practices
3. **Validation** - ensure workspace packages work together correctly

#### Code Quality
- Examples should compile without errors
- Follow TypeScript best practices
- Use clear, descriptive variable names
- Include meaningful comments explaining concepts

### Build Process

```bash
# Build example to verify it compiles
pnpm run build

# Format code for readability
pnpm run format

# Lint for code quality
pnpm run lint
```

### Dependencies

#### Workspace Dependencies
- Use `workspace:*` for local packages being demonstrated
- Examples should use published APIs, not internal implementation

#### Peer Dependencies
- InversifyJS core library is typically a peer dependency
- Allows examples to work with different InversifyJS versions

### Testing Strategy

#### No Unit Tests Needed
- Examples demonstrate usage, not library functionality
- The "test" is whether the example compiles and makes sense
- Integration with the broader ecosystem is tested elsewhere

#### Validation Through Build
```bash
# Verify examples are valid TypeScript
pnpm run build

# Ensure code follows standards
pnpm run lint
pnpm run format
```

### Common Tasks

#### Creating a New Example
1. **Identify the concept** to demonstrate
2. **Create minimal, focused example**
4. **Verify it builds** successfully
5. **Test with actual InversifyJS** usage

#### Updating Examples
1. **Keep examples current** with latest API changes
2. **Verify compatibility** when workspace packages change
3. **Update documentation** if usage patterns change

### Important Notes

#### Focus on Clarity
- Examples should be **easy to understand**
- Avoid complex scenarios that obscure the main concept
- Use realistic but simple use cases

#### Maintain Compatibility
- Examples should work with published InversifyJS versions
- Test examples when making breaking changes to workspace packages
- Update examples before releasing new package versions

#### Documentation Value
- Examples serve as **living documentation**
- Show both basic and advanced usage patterns where relevant
