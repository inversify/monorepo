/* eslint-disable no-useless-assignment */
/* eslint-disable @typescript-eslint/naming-convention */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
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
    ): ((streamOptions: FileStreamOptions) => Promise<void>) => {
      return async (streamOptions: FileStreamOptions): Promise<void> => {
        const { contentType, filePath }: FileStreamOptions = streamOptions;

        // Get file size for Content-Length header
        const fileSize: number = (await stat(filePath)).size;

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
  public async streamFile(
    // SECURITY: Always sanitize your inputs. Validate filename to prevent path traversal attacks
    @Params({ name: 'filename' }, ValidFilenamePipe) filename: string,
    @FileStream() stream: (options: FileStreamOptions) => Promise<void>,
  ): Promise<void> {
    // Stream the file with appropriate content type
    await stream({
      contentType: 'video/mp4',
      filePath: `/var/www/files/${filename}`,
    });
  }
}
