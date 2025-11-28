/* eslint-disable @typescript-eslint/naming-convention */
import { createReadStream, type Stats, statSync } from 'node:fs';
import { Readable } from 'node:stream';

import {
  BadRequestHttpResponse,
  Controller,
  createCustomNativeParameterDecorator,
  CustomNativeParameterDecoratorHandlerOptions,
  Get,
  HttpStatusCode,
  Params,
  Pipe,
  PipeMetadata,
} from '@inversifyjs/http-core';
import { pipeKnownSizeStreamOverResponse } from '@inversifyjs/http-uwebsockets';
import { injectable } from 'inversify';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

export interface FileStreamOptions {
  filePath: string;
  contentType?: string;
}

/**
 * Validates that a filename doesn't contain path traversal sequences
 * to prevent directory traversal attacks (e.g., '../../../etc/passwd')
 */
function isValidFilename(filename: string): boolean {
  // Reject filenames containing path traversal sequences or absolute paths
  return !/[/\\]|\.\./.test(filename);
}

@injectable()
class ValidFilenamePipe implements Pipe<unknown, string> {
  public execute(input: unknown, metadata: PipeMetadata): string {
    if (!this.#isValidFilename(input)) {
      throw new BadRequestHttpResponse({
        message: `Invalid filename param at ${metadata.targetClass.name} at method ${metadata.methodName.toString()} at index ${metadata.parameterIndex.toString()}`,
      });
    }

    return input;
  }

  #isValidFilename(filename: unknown): filename is string {
    return typeof filename === 'string' && !/[/\\]|\.\./.test(filename);
  }
}

// Begin-example
const FileStream: () => ParameterDecorator = () =>
  createCustomNativeParameterDecorator<
    HttpRequest,
    HttpResponse,
    (options: FileStreamOptions) => void,
    undefined
  >(
    (
      _request: HttpRequest,
      response: HttpResponse,
      options: CustomNativeParameterDecoratorHandlerOptions<
        HttpRequest,
        HttpResponse,
        undefined
      >,
    ): ((streamOptions: FileStreamOptions) => void) => {
      return (streamOptions: FileStreamOptions): void => {
        const { contentType, filePath }: FileStreamOptions = streamOptions;

        // Get file size for Content-Length header
        const stats: Stats = statSync(filePath);
        const fileSize: number = stats.size;

        // Set response headers
        options.setStatus(_request, response, HttpStatusCode.OK);
        options.setHeader(
          _request,
          response,
          'content-length',
          fileSize.toString(),
        );
        options.setHeader(
          _request,
          response,
          'content-type',
          contentType ?? 'application/octet-stream',
        );

        // Create a readable stream from the file
        const fileStream: Readable = createReadStream(filePath);

        // Use uWebSockets.js native streaming with known size
        // This avoids chunked transfer encoding by providing Content-Length
        pipeKnownSizeStreamOverResponse(
          response,
          fileStream,
          fileSize,
          undefined,
        );
      };
    },
  );

@Controller('/files')
export class FileStreamController {
  @Get(':filename')
  public streamFile(
    // SECURITY: Always sanitize your inputs. Validate filename to prevent path traversal attacks
    @Params({ name: 'filename' }, ValidFilenamePipe) filename: string,
    @FileStream() stream: (options: FileStreamOptions) => void,
  ): void {
    // Stream the file with appropriate content type
    stream({
      contentType: 'video/mp4',
      filePath: `/var/www/files/${filename}`,
    });
  }
}
