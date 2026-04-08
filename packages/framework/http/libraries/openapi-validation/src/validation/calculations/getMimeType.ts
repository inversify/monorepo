const WHITESPACE_THRESHOLD: number = 32;
const SEMICOLON_CHAR_CODE: number = 59;

export function getMimeType(contentTypeValue: string): string {
  let start: number = 0;
  const end: number = contentTypeValue.length;

  // trim leading whitespace
  while (
    start < end &&
    contentTypeValue.charCodeAt(start) <= WHITESPACE_THRESHOLD
  ) {
    start++;
  }

  // find semicolon or end
  let index: number = start;
  while (
    index < end &&
    contentTypeValue.charCodeAt(index) !== SEMICOLON_CHAR_CODE
  ) {
    index++;
  }

  // trim trailing whitespace before semicolon
  let mimeEnd: number = index;
  while (
    mimeEnd > start &&
    contentTypeValue.charCodeAt(mimeEnd - 1) <= WHITESPACE_THRESHOLD
  ) {
    mimeEnd--;
  }

  // lowercase in one go (only allocation)
  return contentTypeValue.slice(start, mimeEnd).toLowerCase();
}
