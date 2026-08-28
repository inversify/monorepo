export function pointerPrefixFromResolutionChain(
  chain: readonly { canonicalId: string }[],
): string | undefined {
  const lastEntry: { canonicalId: string } | undefined =
    chain[chain.length - 1];

  if (lastEntry === undefined) {
    return undefined;
  }

  const fragmentIndex: number = lastEntry.canonicalId.indexOf('#');

  if (fragmentIndex === -1) {
    return undefined;
  }

  const fragment: string = lastEntry.canonicalId.slice(fragmentIndex + 1);

  if (!fragment.startsWith('/')) {
    return undefined;
  }

  return fragment.slice(1);
}
