import { createReadStream, existsSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';

import {
  type HttpResponse,
  NotFoundHttpResponse,
  OkHttpResponse,
} from '@inversifyjs/http-core';
import { lookup as lookupMimeType } from 'mime-types';

export function buildHttpInsightsUiFileResponse(
  bundleDirectory: string,
  relativeFilePath: string,
): HttpResponse {
  const normalizedRoot: string = resolve(bundleDirectory);
  const normalizedPath: string = resolve(normalizedRoot, relativeFilePath);
  const pathWithinBundle: string = relative(normalizedRoot, normalizedPath);

  if (pathWithinBundle.startsWith('..') || isAbsolute(pathWithinBundle)) {
    return new NotFoundHttpResponse();
  }

  if (!existsSync(normalizedPath) || statSync(normalizedPath).isDirectory()) {
    return new NotFoundHttpResponse();
  }

  const mimeType: string | false = lookupMimeType(relativeFilePath);
  const headers: Record<string, string> | undefined =
    mimeType === false ? undefined : { 'Content-Type': mimeType };

  return new OkHttpResponse(createReadStream(normalizedPath), headers);
}
