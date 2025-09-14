# AGENTS.md - Documentation Code Examples

## Package Overview

This directory contains code examples and tools for generating documentation examples. These packages demonstrate usage patterns for the InversifyJS ecosystem but **do not export library code**.

## Working with Code Example Packages

### Key Characteristics
- **Integration tests only** - examples are tested to ensure they work
- **No unit tests** - the code demonstrates usage, not library implementation
- **Generated output** - many examples generate documentation files
- **Multiple InversifyJS versions** - some packages test against v6 and v7

### Test Strategy
```bash
# Run integration tests to verify examples work
pnpm run test:integration

# Examples should demonstrate real-world usage
pnpm run test  # Runs integration tests by default
```

### Development Guidelines

#### Creating New Examples
1. **Focus on real-world scenarios** - examples should solve actual problems
2. **Keep examples simple** - one concept per example
3. **Add integration tests** - ensure examples actually work
4. **Document clearly** - examples serve as documentation

#### Testing Examples
- Use `.int.spec.ts` suffix for integration tests
- Test the **outcome** of the example, not implementation details
- Examples should be **executable and demonstrable**

### Build Process

#### Code Generation
Many packages generate documentation files:
```bash
# Build and generate examples
pnpm run build

# Just generate examples (after build)
pnpm run generate:examples
```

#### Dependencies
- **Multiple InversifyJS versions**: Some packages depend on both `inversify@6.x` and `inversify7@7.x`
- **Example-specific deps**: Dependencies needed for demonstration purposes
- **Generation tools**: Build tools for creating documentation

### Common Tasks

#### Adding a New Example
1. Create example file in appropriate version directory
2. Add corresponding `.int.spec.ts` test file
3. Verify example works: `pnpm run test:integration`
4. Update generation scripts if needed

#### Updating for New InversifyJS Version
1. Add new version directory (e.g., `v8/`)
2. Port relevant examples from previous version
3. Update dependencies in `package.json`
4. Verify all examples work with new version

### Important Notes

#### No Unit Tests
- These packages **do not need unit tests**
- Integration tests verify examples work correctly
- Focus on demonstrating proper usage patterns

#### Multiple Dependency Versions
- Some packages test against multiple InversifyJS versions
- Use package aliases (e.g., `"inversify7": "npm:inversify@7.9.1"`)
- Organize examples by version in separate directories

#### Generated Content
- Many packages generate files in `generated/` directory
- These files are typically committed to show output
- Build process should be reproducible and deterministic
