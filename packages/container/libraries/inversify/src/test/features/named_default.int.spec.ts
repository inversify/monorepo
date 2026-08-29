import { resolve } from 'rflct';
import { describe, expect, it } from 'vitest';

import {
  Container,
  type Inject,
  type Injectable,
  type InjectNamed,
} from '../../index.js';

describe('Named default', () => {
  it('Should be able to inject a default to avoid ambiguous binding exceptions', () => {
    interface Weapon {
      name: string;
    }

    interface Warrior {
      name: string;
      weapon: Weapon;
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

    class Samurai implements Warrior, Injectable {
      public name: string;
      public weapon: Weapon;
      constructor(weapon: Inject<Weapon>) {
        this.name = 'Samurai';
        this.weapon = weapon;
      }
    }

    class Ninja implements Warrior, Injectable {
      public name: string;
      public weapon: Weapon;
      constructor(weapon: InjectNamed<Weapon, 'throwable'>) {
        this.name = 'Ninja';
        this.weapon = weapon;
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Warrior>()).to(Ninja).whenNamed('chinese');
    container.bind(resolve<Warrior>()).to(Samurai).whenNamed('japanese');
    container.bind(resolve<Weapon>()).to(Shuriken).whenNamed('throwable');
    container.bind(resolve<Weapon>()).to(Katana).whenDefault();

    const ninja: Warrior = container.get(resolve<Warrior>(), {
      name: 'chinese',
    });
    const samurai: Warrior = container.get(resolve<Warrior>(), {
      name: 'japanese',
    });

    expect(ninja.name).toBe('Ninja');
    expect(ninja.weapon.name).toBe('Shuriken');
    expect(samurai.name).toBe('Samurai');
    expect(samurai.weapon.name).toBe('Katana');
  });

  it('Should be able to select a default to avoid ambiguous binding exceptions', () => {
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

    const container: Container = new Container();
    container.bind(resolve<Weapon>()).to(Shuriken).whenNamed('throwable');
    container
      .bind(resolve<Weapon>())
      .to(Katana)
      .inSingletonScope()
      .whenDefault();

    const defaultWeapon: Weapon = container.get(resolve<Weapon>());
    const throwableWeapon: Weapon = container.get(resolve<Weapon>(), {
      name: 'throwable',
    });

    expect(defaultWeapon.name).toBe('Katana');
    expect(throwableWeapon.name).toBe('Shuriken');
  });
});
