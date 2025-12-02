import { describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { Container } from '../container/services/Container';

describe('inversify/InversifyJS#1857', () => {
  it('Child container should point to the right parent services after restore', () => {
    const parent: Container = new Container();
    const container: Container = new Container({ parent });

    parent.bind<string>('weapon').toConstantValue('Katana');

    parent.snapshot();
    parent.restore();

    parent.rebindSync<string>('weapon').toConstantValue('Shuriken');

    expect(parent.get<string>('weapon')).to.equal('Shuriken');
    expect(container.get<string>('weapon')).to.equal('Shuriken');
  });
});
