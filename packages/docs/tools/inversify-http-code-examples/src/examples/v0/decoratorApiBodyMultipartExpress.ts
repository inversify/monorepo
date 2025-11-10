import { Controller, Post, Request } from '@inversifyjs/http-core';
import type express from 'express';

export interface MultipartResult {
  fileCount: number;
  username: string;
}

/**
 * Example showing multipart/form-data handling with Express adapters.
 *
 * Express adapters require multer middleware to be registered on the Express app
 * before building the InversifyJS HTTP server.
 *
 * With multer, files are in request.files and text fields are in request.body.
 */
@Controller('/users')
export class MultipartExpressController {
  @Post()
  public createUser(@Request() request: express.Request): MultipartResult {
    // With multer's .any(), file uploads are in request.files
    // and text form fields are in request.body
    const files: Express.Multer.File[] = (request.files ??
      []) as Express.Multer.File[];
    const body: { username?: string } = request.body as {
      username?: string;
    };

    return {
      fileCount: files.length,
      username: body.username ?? '',
    };
  }
}
