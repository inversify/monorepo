/*
 * Monotonically increasing id used to make every generated function's
 * source text unique (see buildZeroConstructorArgumentsResolveNode below).
 */
let nextGeneratedResolverId: number = 0;

export function getGeneratedResolverId(): number {
  return nextGeneratedResolverId++;
}
