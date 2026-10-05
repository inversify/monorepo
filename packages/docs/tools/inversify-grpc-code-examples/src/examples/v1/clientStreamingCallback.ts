import {
  type sendUnaryData,
  type ServerReadableStream,
  status,
} from '@grpc/grpc-js';
import { Call, Callback, RPC, Service } from '@inversifyjs/grpc-core';

import {
  heroUploadServiceDefinition,
  type UploadRequest,
  type UploadResponse,
} from './loadHeroServiceDefinition.js';

@Service(heroUploadServiceDefinition)
export class CallbackHeroUploadService {
  @RPC('UploadHeroes')
  public uploadHeroes(
    @Call() call: ServerReadableStream<UploadRequest, UploadResponse>,
    @Callback() callback: sendUnaryData<UploadResponse>,
  ): void {
    const names: string[] = [];

    call.on('data', (request: UploadRequest): void => {
      names.push(request.name);
    });
    call.on('end', (): void => {
      callback(null, {
        names,
      });
    });
    call.on('error', (error: Error): void => {
      callback({
        code: status.UNKNOWN,
        details: error.message,
      });
    });
  }
}
