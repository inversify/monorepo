import { ServiceError } from '@grpc/grpc-js';

import { HeroRequest } from './HeroRequest.js';
import { HeroResponse } from './HeroResponse.js';

export interface HeroClient {
  GetHero(
    request: HeroRequest,
    callback: (error: ServiceError | null, response?: HeroResponse) => void,
  ): void;
  close(): void;
}
