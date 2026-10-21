export interface HttpStatusCode {
  readonly code: number;
  readonly reason: string;
}

export const HTTP_STATUS_CODES: readonly HttpStatusCode[] = [
  { code: 100, reason: 'Continue' },
  { code: 101, reason: 'Switching Protocols' },
  { code: 102, reason: 'Processing' },
  { code: 103, reason: 'Early Hints' },
  { code: 200, reason: 'OK' },
  { code: 201, reason: 'Created' },
  { code: 202, reason: 'Accepted' },
  { code: 203, reason: 'Non-Authoritative Information' },
  { code: 204, reason: 'No Content' },
  { code: 205, reason: 'Reset Content' },
  { code: 206, reason: 'Partial Content' },
  { code: 207, reason: 'Multi-Status' },
  { code: 208, reason: 'Already Reported' },
  { code: 226, reason: 'IM Used' },
  { code: 300, reason: 'Multiple Choices' },
  { code: 301, reason: 'Moved Permanently' },
  { code: 302, reason: 'Found' },
  { code: 303, reason: 'See Other' },
  { code: 304, reason: 'Not Modified' },
  { code: 305, reason: 'Use Proxy' },
  { code: 307, reason: 'Temporary Redirect' },
  { code: 308, reason: 'Permanent Redirect' },
  { code: 400, reason: 'Bad Request' },
  { code: 401, reason: 'Unauthorized' },
  { code: 402, reason: 'Payment Required' },
  { code: 403, reason: 'Forbidden' },
  { code: 404, reason: 'Not Found' },
  { code: 405, reason: 'Method Not Allowed' },
  { code: 406, reason: 'Not Acceptable' },
  { code: 407, reason: 'Proxy Authentication Required' },
  { code: 408, reason: 'Request Timeout' },
  { code: 409, reason: 'Conflict' },
  { code: 410, reason: 'Gone' },
  { code: 411, reason: 'Length Required' },
  { code: 412, reason: 'Precondition Failed' },
  { code: 413, reason: 'Payload Too Large' },
  { code: 414, reason: 'URI Too Long' },
  { code: 415, reason: 'Unsupported Media Type' },
  { code: 416, reason: 'Range Not Satisfiable' },
  { code: 417, reason: 'Expectation Failed' },
  { code: 418, reason: "I'm a Teapot" },
  { code: 421, reason: 'Misdirected Request' },
  { code: 422, reason: 'Unprocessable Entity' },
  { code: 423, reason: 'Locked' },
  { code: 424, reason: 'Failed Dependency' },
  { code: 425, reason: 'Too Early' },
  { code: 426, reason: 'Upgrade Required' },
  { code: 428, reason: 'Precondition Required' },
  { code: 429, reason: 'Too Many Requests' },
  { code: 431, reason: 'Request Header Fields Too Large' },
  { code: 451, reason: 'Unavailable For Legal Reasons' },
  { code: 500, reason: 'Internal Server Error' },
  { code: 501, reason: 'Not Implemented' },
  { code: 502, reason: 'Bad Gateway' },
  { code: 503, reason: 'Service Unavailable' },
  { code: 504, reason: 'Gateway Timeout' },
  { code: 505, reason: 'HTTP Version Not Supported' },
  { code: 506, reason: 'Variant Also Negotiates' },
  { code: 507, reason: 'Insufficient Storage' },
  { code: 508, reason: 'Loop Detected' },
  { code: 509, reason: 'Bandwidth Limit Exceeded' },
  { code: 510, reason: 'Not Extended' },
  { code: 511, reason: 'Network Authentication Required' },
];

export function formatHttpStatusCode(status: HttpStatusCode): string {
  return `${String(status.code)} ${status.reason}`;
}

export function readHttpStatusCode(code: number): HttpStatusCode | undefined {
  return HTTP_STATUS_CODES.find(
    (status: HttpStatusCode): boolean => status.code === code,
  );
}

export function filterHttpStatusCodes(
  query: string,
): readonly HttpStatusCode[] {
  const normalized: string = query.trim().toLowerCase();

  if (normalized.length === 0) {
    return HTTP_STATUS_CODES;
  }

  if (/^\d+$/u.test(normalized)) {
    return HTTP_STATUS_CODES.filter((status: HttpStatusCode): boolean =>
      String(status.code).startsWith(normalized),
    );
  }

  return HTTP_STATUS_CODES.filter((status: HttpStatusCode): boolean =>
    formatHttpStatusCode(status).toLowerCase().includes(normalized),
  );
}
