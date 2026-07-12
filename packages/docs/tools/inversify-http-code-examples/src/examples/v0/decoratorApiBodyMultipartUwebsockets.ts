import { TextDecoder } from 'node:util';

import { Body, Controller, Post } from '@inversifyjs/http-core';
import { MultipartField } from 'uWebSockets.js';

export interface UploadResult {
  fileName: string;
  username: string;
}

// Begin-example
@Controller('/uploads')
export class BodyMultipartUwebsocketsController {
  @Post()
  public async uploadFile(
    @Body() body: MultipartField[] | undefined,
  ): Promise<UploadResult> {
    // With uWebSockets.js, multipart/form-data is parsed into an array of MultipartField objects
    let fileName: string = '';
    let username: string = '';

    if (body !== undefined) {
      const textDecoder: TextDecoder = new TextDecoder();

      for (const field of body) {
        if (field.filename !== undefined) {
          fileName = field.filename;
        } else if (field.name === 'username') {
          username = textDecoder.decode(field.data);
        }
      }
    }

    return { fileName, username };
  }
}
