# @inversifyjs/code-examples

Inversify docs code examples.

## Adding code examples

1. Just create your code example in the `src/examples` folder with an integration test to verify the expected behavior.
  - Use a `// Begin-example` comment to set the begining of the example.
  - Use a `// Exclude-from-example` comment to exclude a sentence from the example.
  - Use a `// Is-inversify-import-example` comment to normalize inversify imports.
  - Use a `// End-example` comment to set the end of the example.
  - Use a `// Shift-line-spaces-2` comment to shitf lines 2 spaces to the left. The comment's scope is the whole source file.
2. Run the `build` script.
3. Your code example will be available in the `generated/examples` folder.
