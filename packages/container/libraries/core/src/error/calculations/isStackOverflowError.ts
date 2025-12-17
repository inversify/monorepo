/*
 * V8 (Chrome, Node.js, Edge, Deno): "Maximum call stack size exceeded"
 * SpiderMonkey (Firefox): "too much recursion"
 * JavaScriptCore (Safari): "call stack size exceeded"
 * Chakra (IE/legacy Edge): "Out of stack space"
 */
const STACK_OVERFLOW_PATTERNS: RegExp =
  /stack space|call stack|too much recursion/i;

// SpiderMonkey throws InternalError with "too much recursion"
const SPIDER_MONKEY_REGEXP: RegExp = /too much recursion/;

export function isStackOverflowError(error: unknown): boolean {
  try {
    if (!(error instanceof Error)) {
      return false;
    }

    return (
      // V8 and JavaScriptCore typically throw RangeError
      (error instanceof RangeError &&
        STACK_OVERFLOW_PATTERNS.test(error.message)) ||
      (error.name === 'InternalError' &&
        SPIDER_MONKEY_REGEXP.test(error.message))
    );
  } catch (innerError: unknown) {
    /*
     * The following code flow can lead to a secondary stack overflow:
     * 1. Code flow triggers infinite recursion
     * 3. On V8, `RangeError: Maximum call stack size exceeded` is thrown
     * 4. `isStackOverflowError(error)` is called in a catch block
     * 5. regex.test()` is called when the call stack is nearly exhausted
     * 6. Regex execution requires stack space, causing a secondary stack overflow
     * 7. V8 reports this as: `SyntaxError: Invalid regular expression: ... Stack overflow`
     */
    return (
      innerError instanceof SyntaxError &&
      innerError.message.includes('Stack overflow')
    );
  }
}
