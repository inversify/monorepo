import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../common/models/defaultAlias.js';
import { InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';
import { getContainerOrFail } from '../../container/calculations/getContainerOrFail.js';
import { HeroService } from '../models/HeroService.js';

function givenUnaryHeroService(this: InversifyGrpcWorld): void {
  const container: Container = getContainerOrFail.bind(this)(defaultAlias);

  container.bind(HeroService).toSelf();
}

Given<InversifyGrpcWorld>(
  'a unary hero service for container',
  function (): void {
    givenUnaryHeroService.bind(this)();
  },
);
