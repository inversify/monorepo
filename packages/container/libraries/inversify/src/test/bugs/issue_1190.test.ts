import { resolve } from 'rflct';
import { describe, expect, it } from 'vitest';

import {
  Container,
  type Inject,
  type Injectable,
  type InjectNamed,
  type InjectOptional,
} from '../../index.js';

describe('Issue 1190', () => {
  it('should inject a katana as default weapon to ninja', () => {
    interface Weapon {
      name: string;
    }

    class Katana implements Weapon, Injectable {
      public name: string;
      constructor() {
        this.name = 'Katana';
      }
    }

    class Shuriken implements Weapon, Injectable {
      public name: string;
      constructor() {
        this.name = 'Shuriken';
      }
    }

    class Ninja implements Injectable {
      public name: string;
      public katana: Katana;
      public shuriken: Shuriken;
      constructor(
        katana: InjectOptional<Weapon>,
        shuriken: InjectNamed<Weapon, 'throwable'>,
      ) {
        this.name = 'Ninja';
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container: Container = new Container();

    container.bind(resolve<Weapon>()).to(Katana).whenDefault();
    container.bind(resolve<Weapon>()).to(Shuriken).whenNamed('throwable');

    container.bind(resolve<Ninja>()).to(Ninja);

    const ninja: Ninja = container.get(resolve<Ninja>());

    expect(ninja.katana).toStrictEqual(new Katana());
  });
});
