import { describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { ResolutionContext } from '@inversifyjs/core';

import { Container } from '../container/services/Container';

describe('Container restore should restore activations', () => {
  it('Should save and restore the container activations and deactivations when snapshot and restore', async () => {
    const sid: string = 'sid';
    const container: Container = new Container();
    container.bind<string>(sid).toConstantValue('Value');

    let activated: boolean = false;
    let deactivated: boolean = false;

    container.snapshot();

    container.onActivation<string>(sid, (_c: ResolutionContext, i: string) => {
      activated = true;
      return i;
    });
    container.onDeactivation(sid, (_i: unknown) => {
      deactivated = true;
    });

    container.restore();

    container.get(sid);
    await container.unbind(sid);

    expect(activated).to.equal(false);
    expect(deactivated).to.equal(false);
  });
});
