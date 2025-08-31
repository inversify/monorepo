import { Given } from '@cucumber/cucumber';
import { Container } from 'inversify';

import { defaultAlias } from '../../common/models/defaultAlias';
import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';
import { setContainer } from '../actions/setContainer';

function givenContainer(
  this: InversifyHttpWorld,
  containerAlias?: string,
): void {
  const alias: string = containerAlias ?? defaultAlias;

  setContainer.bind(this)(alias, new Container());
}

Given<InversifyHttpWorld>('a container', function (): void {
  givenContainer.bind(this)();
});
