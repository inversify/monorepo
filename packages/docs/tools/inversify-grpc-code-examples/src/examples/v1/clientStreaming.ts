import { type ServerReadableStream } from '@grpc/grpc-js';
import { RPC, Service } from '@inversifyjs/grpc-core';

import {
  heroUploadServiceDefinition,
  type UploadRequest,
  type UploadResponse,
} from './loadHeroServiceDefinition.js';

@Service(heroUploadServiceDefinition)
export class HeroUploadService {
  @RPC('UploadHeroes')
  public async uploadHeroes(
    call: ServerReadableStream<UploadRequest, UploadResponse>,
  ): Promise<UploadResponse> {
    const names: string[] = [];

    return new Promise<UploadResponse>(
      (
        resolve: (response: UploadResponse) => void,
        reject: (error: Error) => void,
      ): void => {
        call.on('data', (request: UploadRequest): void => {
          names.push(request.name);
        });
        call.on('end', (): void => {
          resolve({
            names,
          });
        });
        call.on('error', (error: Error): void => {
          reject(error);
        });
      },
    );
  }
}
