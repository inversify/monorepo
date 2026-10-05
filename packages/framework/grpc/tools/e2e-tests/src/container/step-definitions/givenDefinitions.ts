import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../common/models/defaultAlias.js';
import { InversifyGrpcWorld } from '../../common/models/InversifyGrpcWorld.js';
import { setContainer } from '../actions/setContainer.js';

function givenContainer(
  this: InversifyGrpcWorld,
  containerAlias?: string,
): void {
  const alias: string = containerAlias ?? defaultAlias;

  setContainer.bind(this)(alias, new Container());
}

Given<InversifyGrpcWorld>('a container', function (): void {
  givenContainer.bind(this)();
});
