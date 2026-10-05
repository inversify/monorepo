import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../common/models/defaultAlias.js';
import { InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';
import { getContainerOrFail } from '../../container/calculations/getContainerOrFail.js';
import { DecoratedHeroService } from '../models/DecoratedHeroService.js';
import { HeroService } from '../models/HeroService.js';

function givenHeroService(this: InversifyGrpcWorld): void {
  const container: Container = getContainerOrFail.bind(this)(defaultAlias);

  container.bind(HeroService).toSelf();
}

function givenDecoratedHeroService(this: InversifyGrpcWorld): void {
  const container: Container = getContainerOrFail.bind(this)(defaultAlias);

  container.bind(DecoratedHeroService).toSelf();
}

Given<InversifyGrpcWorld>('a hero service for container', function (): void {
  givenHeroService.bind(this)();
});

Given<InversifyGrpcWorld>(
  'a decorated hero service for container',
  function (): void {
    givenDecoratedHeroService.bind(this)();
  },
);
