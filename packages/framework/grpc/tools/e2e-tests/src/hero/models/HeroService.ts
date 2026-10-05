import {
  type ServerDuplexStream,
  type ServerReadableStream,
  type ServerWritableStream,
} from '@grpc/grpc-js';
import { RPC, Service } from '@inversifyjs/grpc-core';

import {
  type ChatMessage,
  type HeroRequest,
  type HeroResponse,
  HeroServiceService,
  type UploadRequest,
  type UploadResponse,
} from '../generated/hero.js';

@Service(HeroServiceService)
export class HeroService {
  @RPC('chat')
  public chat(call: ServerDuplexStream<ChatMessage, ChatMessage>): void {
    call.on('data', (message: ChatMessage): void => {
      call.write({
        text: message.text,
      });
    });
    call.on('end', (): void => {
      call.end();
    });
  }

  @RPC('getHero')
  public getHero(call: { request: HeroRequest }): HeroResponse {
    return {
      name: call.request.id,
    };
  }

  @RPC('listHeroes')
  public listHeroes(
    call: ServerWritableStream<HeroRequest, HeroResponse>,
  ): void {
    const id: string = call.request.id;

    call.write({
      name: `${id}-a`,
    });
    call.write({
      name: `${id}-b`,
    });
    call.end();
  }

  @RPC('uploadHeroes')
  public async uploadHeroes(
    call: ServerReadableStream<UploadRequest, UploadResponse>,
  ): Promise<UploadResponse> {
    return new Promise<UploadResponse>(
      (
        resolve: (response: UploadResponse) => void,
        reject: (error: Error) => void,
      ): void => {
        const names: string[] = [];

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
