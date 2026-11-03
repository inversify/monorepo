import { Given } from '@cucumber/cucumber';
import { Container } from '@inversifyjs/container';

import { defaultAlias } from '../../common/models/defaultAlias';
import { type InversifyWorld } from '../../common/models/InversifyWorld';
import { setContainer } from '../actions/setContainer';
import { getContainerOrFail } from '../calculations/getContainerOrFail';

function givenContainer(this: InversifyWorld, containerAlias?: string): void {
  const alias: string = containerAlias ?? defaultAlias;

  setContainer.bind(this)(alias, new Container());
}

function givenContainerWithParent(
  this: InversifyWorld,
  containerAlias: string,
  parentContainerAlias: string,
): void {
  const parentContainer: Container =
    getContainerOrFail.bind(this)(parentContainerAlias);

  setContainer.bind(this)(
    containerAlias,
    new Container({
      parent: parentContainer,
    }),
  );
}

Given<InversifyWorld>('a container', function (): void {
  givenContainer.bind(this)();
});

Given<InversifyWorld>(
  'a {string} container',
  function (containerAlias: string): void {
    givenContainer.bind(this)(containerAlias);
  },
);

Given<InversifyWorld>(
  'a {string} container with {string} parent',
  function (containerAlias: string, parentContainerAlias: string): void {
    givenContainerWithParent.bind(this)(containerAlias, parentContainerAlias);
  },
);
