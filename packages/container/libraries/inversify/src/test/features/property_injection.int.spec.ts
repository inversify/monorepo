import { resolve } from 'rflct';
import { describe, expect, it } from 'vitest';

import {
  Container,
  type Inject,
  type Injectable,
  type InjectMulti,
  type InjectNamed,
  type InjectOptional,
  type InjectTagged,
  type InjectUnmanaged,
} from '../../index.js';

describe('Property Injection', () => {
  it('Should be able to inject a property', () => {
    interface Weapon {
      name: string;
    }

    class Katana implements Weapon, Injectable {
      public name: string;
      constructor() {
        this.name = 'Katana';
      }
    }

    interface Warrior {
      name: string;
      weapon: Weapon;
    }

    class Samurai implements Warrior, Injectable {
      public weapon!: Inject<Weapon>;
      public name: string;

      constructor() {
        this.name = 'Samurai';
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Warrior>()).to(Samurai);
    container.bind(resolve<Weapon>()).to(Katana);

    const warrior: Warrior = container.get(resolve<Warrior>());

    expect(warrior.name).toBe('Samurai');
    expect(warrior.weapon).toBeDefined();
    expect(warrior.weapon.name).toBe('Katana');
  });

  it('Should be able to inject a property combined with constructor injection', () => {
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

    interface Warrior {
      name: string;
      primaryWeapon: Weapon;
      secondaryWeapon: Weapon;
    }

    class Samurai implements Warrior, Injectable {
      public secondaryWeapon!: InjectNamed<Weapon, 'Secondary'>;
      public name: string;
      public primaryWeapon: Weapon;

      constructor(weapon: InjectNamed<Weapon, 'Primary'>) {
        this.name = 'Samurai';
        this.primaryWeapon = weapon;
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Warrior>()).to(Samurai);
    container.bind(resolve<Weapon>()).to(Katana).whenNamed('Primary');
    container.bind(resolve<Weapon>()).to(Shuriken).whenNamed('Secondary');

    const warrior: Warrior = container.get(resolve<Warrior>());

    expect(warrior.name).toBe('Samurai');
    expect(warrior.primaryWeapon).toBeDefined();
    expect(warrior.primaryWeapon.name).toBe('Katana');
    expect(warrior.secondaryWeapon).toBeDefined();
    expect(warrior.secondaryWeapon.name).toBe('Shuriken');
  });

  it('Should be able to inject a named property', () => {
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

    interface Warrior {
      name: string;
      primaryWeapon: Weapon;
      secondaryWeapon: Weapon;
    }

    class Samurai implements Warrior, Injectable {
      public primaryWeapon!: InjectNamed<Weapon, 'Primary'>;

      public secondaryWeapon!: InjectNamed<Weapon, 'Secondary'>;

      public name: string;

      constructor() {
        this.name = 'Samurai';
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Warrior>()).to(Samurai);
    container.bind(resolve<Weapon>()).to(Katana).whenNamed('Primary');
    container.bind(resolve<Weapon>()).to(Shuriken).whenNamed('Secondary');

    const warrior: Warrior = container.get(resolve<Warrior>());

    expect(warrior.name).toBe('Samurai');
    expect(warrior.primaryWeapon).toBeDefined();
    expect(warrior.primaryWeapon.name).toBe('Katana');
    expect(warrior.secondaryWeapon).toBeDefined();
    expect(warrior.secondaryWeapon.name).toBe('Shuriken');
  });

  it('Should be able to inject a tagged property', () => {
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

    interface Warrior {
      name: string;
      primaryWeapon: Weapon;
      secondaryWeapon: Weapon;
    }

    class Samurai implements Warrior, Injectable {
      public primaryWeapon!: InjectTagged<Weapon, 'Priority', 'Primary'>;

      public secondaryWeapon!: InjectTagged<Weapon, 'Priority', 'Secondary'>;

      public name: string;

      constructor() {
        this.name = 'Samurai';
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Warrior>()).to(Samurai);
    container
      .bind(resolve<Weapon>())
      .to(Katana)
      .whenTagged('Priority', 'Primary');
    container
      .bind(resolve<Weapon>())
      .to(Shuriken)
      .whenTagged('Priority', 'Secondary');

    const warrior: Warrior = container.get(resolve<Warrior>());

    expect(warrior.name).toBe('Samurai');
    expect(warrior.primaryWeapon).toBeDefined();
    expect(warrior.primaryWeapon.name).toBe('Katana');
    expect(warrior.secondaryWeapon).toBeDefined();
    expect(warrior.secondaryWeapon.name).toBe('Shuriken');
  });

  it('Should be able to multi-inject a property', () => {
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

    interface Warrior {
      name: string;
      weapons: Weapon[];
    }

    class Samurai implements Warrior, Injectable {
      public weapons!: InjectMulti<Weapon>;
      public name: string;

      constructor() {
        this.name = 'Samurai';
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Warrior>()).to(Samurai);
    container.bind(resolve<Weapon>()).to(Katana);
    container.bind(resolve<Weapon>()).to(Shuriken);

    const warrior: Warrior = container.get(resolve<Warrior>());

    expect(warrior.name).toBe('Samurai');
    expect(warrior.weapons[0]).toBeDefined();
    expect(warrior.weapons[0]?.name).toBe('Katana');
    expect(warrior.weapons[1]).toBeDefined();
    expect(warrior.weapons[1]?.name).toBe('Shuriken');
  });

  it('Should be able to inject a property in a base class', () => {
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

    interface Warrior {
      name: string;
      primaryWeapon: Weapon;
    }

    class BaseWarrior implements Warrior, Injectable {
      public primaryWeapon!: InjectTagged<Weapon, 'Priority', 'Primary'>;
      public name: string;

      constructor(name: InjectUnmanaged<string>) {
        this.name = name;
      }
    }

    class Samurai extends BaseWarrior implements Injectable {
      public secondaryWeapon!: InjectTagged<Weapon, 'Priority', 'Secondary'>;

      constructor() {
        super('Samurai');
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Warrior>()).to(Samurai);
    container
      .bind(resolve<Weapon>())
      .to(Katana)
      .whenTagged('Priority', 'Primary');
    container
      .bind(resolve<Weapon>())
      .to(Shuriken)
      .whenTagged('Priority', 'Secondary');

    const samurai = container.get(resolve<Warrior>()) as Samurai;

    expect(samurai.name).toBe('Samurai');
    expect(samurai.secondaryWeapon).toBeDefined();
    expect(samurai.secondaryWeapon.name).toBe('Shuriken');
    expect(samurai.primaryWeapon).toBeDefined();
    expect(samurai.primaryWeapon.name).toBe('Katana');
  });

  it('Should be able to flag a property injection as optional', () => {
    interface Route {
      name: string;
    }

    class Router implements Injectable {
      private readonly route!: InjectOptional<Route>;

      public getRoute(): Route {
        return this.route;
      }
    }

    const container: Container = new Container();

    container.bind(resolve<Router>()).to(Router);

    const router1: Router = container.get(resolve<Router>());

    expect(router1.getRoute()).toBeUndefined();

    container.bind(resolve<Route>()).toConstantValue({ name: 'route1' });

    const router2: Router = container.get(resolve<Router>());

    expect(router2.getRoute().name).toBe('route1');
  });
});
