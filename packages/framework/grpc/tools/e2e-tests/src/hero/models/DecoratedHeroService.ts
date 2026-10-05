import {
  type sendUnaryData,
  type ServerDuplexStream,
  type ServerReadableStream,
  type ServerWritableStream,
  status,
} from '@grpc/grpc-js';
import { Call, Callback, RPC, Service } from '@inversifyjs/grpc-core';

import {
  type ChatMessage,
  type HeroRequest,
  type HeroResponse,
  HeroServiceService,
  type UploadRequest,
  type UploadResponse,
} from '../generated/hero.js';

@Service(HeroServiceService)
export class DecoratedHeroService {
  @RPC('chat')
  public chat(
    @Call() call: ServerDuplexStream<ChatMessage, ChatMessage>,
  ): void {
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
  public getHero(
    @Call() call: { request: HeroRequest },
    @Callback() callback: sendUnaryData<HeroResponse>,
  ): void {
    callback(null, {
      name: call.request.id,
    });
  }

  @RPC('listHeroes')
  public listHeroes(
    @Call() call: ServerWritableStream<HeroRequest, HeroResponse>,
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
