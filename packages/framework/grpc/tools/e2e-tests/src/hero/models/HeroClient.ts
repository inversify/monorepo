import {
  type ClientDuplexStream,
  type ClientReadableStream,
  type ClientWritableStream,
  type ServiceError,
} from '@grpc/grpc-js';

import {
  type ChatMessage,
  type HeroRequest,
  type HeroResponse,
  type UploadRequest,
  type UploadResponse,
} from '../generated/hero.js';

export interface HeroClient {
  chat(): ClientDuplexStream<ChatMessage, ChatMessage>;
  close(): void;
  getHero(
    request: HeroRequest,
    callback: (error: ServiceError | null, response?: HeroResponse) => void,
  ): void;
  listHeroes(request: HeroRequest): ClientReadableStream<HeroResponse>;
  uploadHeroes(
    callback: (error: ServiceError | null, response?: UploadResponse) => void,
  ): ClientWritableStream<UploadRequest>;
}
