const SYMBOL_INDEX_START: number = 7;
const SYMBOL_INDEX_END: number = -1;

export function getDescription(symbol: symbol): string {
  return symbol.toString().slice(SYMBOL_INDEX_START, SYMBOL_INDEX_END);
}
