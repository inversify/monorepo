// Inspired on https://github.com/bnoordhuis/mozilla-central/blob/28b39571c584530df4b0b74bf9d929942906c081/netwerk/protocol/http/nsHttpHeaderArray.h

const LF_SEPARATED_HEADERS_SET: Set<string> = new Set<string>([
  'proxy-authenticate',
  'set-cookie',
  'www-authenticate',
]);

export function concatenateHeaders(
  lowercaseHeaderName: string,
  firstValue: string,
  secondValue: string,
): string {
  const isLfSeparated: boolean =
    LF_SEPARATED_HEADERS_SET.has(lowercaseHeaderName);

  return isLfSeparated
    ? `${firstValue}\n${secondValue}`
    : `${firstValue}, ${secondValue}`;
}
