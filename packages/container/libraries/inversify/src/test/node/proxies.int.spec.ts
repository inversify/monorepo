import { resolve } from 'rflct';
import { describe, expect, it } from 'vitest';

import {
  Container,
  type Inject,
  type Injectable,
  type ResolutionContext,
} from '../../index.js';

describe('InversifyJS', () => {
  it('Should support the injection of proxied objects', () => {
    interface Weapon {
      use(): void;
    }

    class Katana implements Weapon, Injectable {
      public use() {
        return 'Used Katana!';
      }
    }

    interface Warrior {
      weapon: Weapon;
    }

    class Ninja implements Warrior, Injectable {
      public weapon: Weapon;
      constructor(weapon: Inject<Weapon>) {
        this.weapon = weapon;
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Warrior>()).to(Ninja);
    const log: string[] = [];

    container
      .bind(resolve<Weapon>())
      .to(Katana)
      .onActivation((_context: ResolutionContext, weapon: Weapon) => {
        const handler: ProxyHandler<() => void> = {
          apply(
            target: () => void,
            thisArgument: unknown,
            argumentsList: [],
          ): void {
            log.push(`Starting: ${new Date().getTime().toString()}`);
            target.apply(thisArgument, argumentsList);
            log.push(`Finished: ${new Date().getTime().toString()}`);
          },
        };
        weapon.use = new Proxy(weapon.use.bind(weapon), handler);
        return weapon;
      });

    const ninja = container.get(resolve<Warrior>());
    ninja.weapon.use();

    expect(log).toHaveLength(2);
    expect(log[0]?.indexOf('Starting: ')).not.toBe(-1);
    expect(log[1]?.indexOf('Finished: ')).not.toBe(-1);
  });
});
