import { Buffer } from 'node:buffer';

const SOURCE_MAPPING_URL_PATTERN: RegExp =
  /\/\/[#@][ \t]*sourceMappingURL=[ \t]*([^\s'"]+)|\/\*[#@][ \t]*sourceMappingURL=[ \t]*([^\s*]+)[ \t]*\*\//gu;

interface InlineSourceMapLocation {
  readonly json: string;
  readonly kind: 'inline';
}

interface UrlSourceMapLocation {
  readonly kind: 'url';
  readonly url: string;
}

export type SourceMapLocation = InlineSourceMapLocation | UrlSourceMapLocation;

export function readSourceMapLocation(
  source: string,
): SourceMapLocation | null {
  const url: string | null = readLastSourceMappingUrl(source);

  if (url === null) {
    return null;
  }

  if (url.startsWith('data:')) {
    const json: string | null = readDataUrlJson(url);

    if (json === null || json.length === 0) {
      return null;
    }

    return {
      json,
      kind: 'inline',
    };
  }

  return {
    kind: 'url',
    url,
  };
}

function readDataUrlJson(url: string): string | null {
  const commaIndex: number = url.indexOf(',');

  if (commaIndex < 0) {
    return null;
  }

  const metadata: string = url.slice('data:'.length, commaIndex);
  const payload: string = url.slice(commaIndex + 1);

  if (payload.length === 0) {
    return null;
  }

  try {
    if (metadata.split(';').includes('base64')) {
      return Buffer.from(payload, 'base64').toString('utf8');
    }

    return decodeURIComponent(payload);
  } catch (_error: unknown) {
    return null;
  }
}

function readLastSourceMappingUrl(source: string): string | null {
  SOURCE_MAPPING_URL_PATTERN.lastIndex = 0;

  let lastUrl: string | null = null;
  let match: RegExpExecArray | null = SOURCE_MAPPING_URL_PATTERN.exec(source);

  while (match !== null) {
    const url: string | undefined = match[1] ?? match[2];

    if (url !== undefined && url.length > 0) {
      lastUrl = url;
    }

    match = SOURCE_MAPPING_URL_PATTERN.exec(source);
  }

  return lastUrl;
}
