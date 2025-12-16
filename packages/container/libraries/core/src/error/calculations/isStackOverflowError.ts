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
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    // V8 and JavaScriptCore typically throw RangeError
    (error instanceof RangeError &&
      STACK_OVERFLOW_PATTERNS.test(error.message)) ||
    (error.name === 'InternalError' && SPIDER_MONKEY_REGEXP.test(error.message))
  );
}
