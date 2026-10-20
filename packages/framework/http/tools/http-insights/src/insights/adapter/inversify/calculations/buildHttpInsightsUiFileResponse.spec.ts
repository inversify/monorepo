import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { text } from 'node:stream/consumers';

import { type HttpResponse, HttpStatusCode } from '@inversifyjs/http-core';

import { buildHttpInsightsUiFileResponse } from './buildHttpInsightsUiFileResponse.js';

describe(buildHttpInsightsUiFileResponse, () => {
  let bundleDirectory: string;

  beforeAll(() => {
    bundleDirectory = mkdtempSync(join(tmpdir(), 'http-insights-ui-'));
    mkdirSync(join(bundleDirectory, 'assets'));
    writeFileSync(join(bundleDirectory, 'index.html'), '<html></html>');
    writeFileSync(join(bundleDirectory, 'assets', 'app.js'), 'console.log(1)');
  });

  afterAll(() => {
    rmSync(bundleDirectory, { force: true, recursive: true });
  });

  describe('having a file inside the bundle', () => {
    describe('when called', () => {
      let response: HttpResponse;
      let body: string;

      beforeAll(async () => {
        response = buildHttpInsightsUiFileResponse(
          bundleDirectory,
          'assets/app.js',
        );
        body = await readBody(response);
      });

      it('should return the file', () => {
        expect(response.statusCode).toBe(HttpStatusCode.OK);
        expect(response.headers).toStrictEqual({
          'Content-Type': 'text/javascript',
        });
        expect(body).toBe('console.log(1)');
      });
    });
  });

  describe('having the index document', () => {
    describe('when called', () => {
      let response: HttpResponse;
      let body: string;

      beforeAll(async () => {
        response = buildHttpInsightsUiFileResponse(
          bundleDirectory,
          'index.html',
        );
        body = await readBody(response);
      });

      it('should return an HTML response', () => {
        expect(response.statusCode).toBe(HttpStatusCode.OK);
        expect(response.headers).toStrictEqual({
          'Content-Type': 'text/html',
        });
        expect(body).toBe('<html></html>');
      });
    });
  });

  describe('having a missing file', () => {
    describe('when called', () => {
      let response: HttpResponse;

      beforeAll(() => {
        response = buildHttpInsightsUiFileResponse(
          bundleDirectory,
          'assets/missing.js',
        );
      });

      it('should return not found', () => {
        expect(response.statusCode).toBe(HttpStatusCode.NOT_FOUND);
      });
    });
  });

  describe('having a directory', () => {
    describe('when called', () => {
      let response: HttpResponse;

      beforeAll(() => {
        response = buildHttpInsightsUiFileResponse(bundleDirectory, 'assets');
      });

      it('should return not found', () => {
        expect(response.statusCode).toBe(HttpStatusCode.NOT_FOUND);
      });
    });
  });

  describe('having a path outside the bundle', () => {
    describe('when called with a parent segment', () => {
      let response: HttpResponse;

      beforeAll(() => {
        response = buildHttpInsightsUiFileResponse(
          bundleDirectory,
          '../secret.txt',
        );
      });

      it('should return not found', () => {
        expect(response.statusCode).toBe(HttpStatusCode.NOT_FOUND);
      });
    });

    describe('when called with an absolute path', () => {
      let response: HttpResponse;

      beforeAll(() => {
        response = buildHttpInsightsUiFileResponse(
          bundleDirectory,
          '/etc/passwd',
        );
      });

      it('should return not found', () => {
        expect(response.statusCode).toBe(HttpStatusCode.NOT_FOUND);
      });
    });
  });
});

async function readBody(response: HttpResponse): Promise<string> {
  if (!(response.body instanceof Readable)) {
    throw new Error('Expected a readable file response.');
  }

  return text(response.body);
}
