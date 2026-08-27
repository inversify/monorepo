import { describe, expect, it } from 'vitest';

import {
  Container,
  type Inject,
  type Injectable,
  type InjectOptional,
} from '../../index.js';

describe('optional', () => {
  it('Should allow to flag dependencies as optional', () => {
    class Katana implements Injectable {
      public name: string;
      constructor() {
        this.name = 'Katana';
      }
    }

    class Shuriken implements Injectable {
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
        katana: Inject<Katana>,
        shuriken: InjectOptional<Shuriken>,
      ) {
        this.name = 'Ninja';
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container: Container = new Container();

    container.bind(Katana).toSelf();
    container.bind(Ninja).toSelf();

    let ninja: Ninja = container.get(Ninja);

    expect(ninja.name).toBe('Ninja');
    expect(ninja.katana.name).toBe('Katana');
    expect(ninja.shuriken).toBeUndefined();

    container.bind(Shuriken).toSelf();

    ninja = container.get(Ninja);

    expect(ninja.name).toBe('Ninja');
    expect(ninja.katana.name).toBe('Katana');
    expect(ninja.shuriken.name).toBe('Shuriken');
  });

  it('Should allow to set a default value for dependencies flagged as optional', () => {
    class Katana implements Injectable {
      public name: string;
      constructor() {
        this.name = 'Katana';
      }
    }

    class Shuriken implements Injectable {
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
        katana: Inject<Katana>,
        shuriken: InjectOptional<Shuriken> = {
          name: 'DefaultShuriken',
        },
      ) {
        this.name = 'Ninja';
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container: Container = new Container();

    container.bind(Katana).toSelf();
    container.bind(Ninja).toSelf();

    let ninja: Ninja = container.get(Ninja);

    expect(ninja.name).to.eql('Ninja');
    expect(ninja.katana.name).to.eql('Katana');
    expect(ninja.shuriken.name).to.eql('DefaultShuriken');

    container.bind(Shuriken).toSelf();

    ninja = container.get(Ninja);

    expect(ninja.name).to.eql('Ninja');
    expect(ninja.katana.name).to.eql('Katana');
    expect(ninja.shuriken.name).to.eql('Shuriken');
  });

  it('Should allow to set a default value for class property dependencies flagged as optional', () => {
    class Katana implements Injectable {
      public name: string;
      constructor() {
        this.name = 'Katana';
      }
    }

    class Shuriken implements Injectable {
      public name: string;
      constructor() {
        this.name = 'Shuriken';
      }
    }

    class Ninja implements Injectable {
      public katana?: Inject<Katana>;
      public shuriken: InjectOptional<Shuriken> = {
        name: 'DefaultShuriken',
      };
      public name: string = 'Ninja';
    }

    const container: Container = new Container();

    container.bind(Katana).toSelf();
    container.bind(Ninja).toSelf();

    let ninja: Ninja = container.get(Ninja);

    expect(ninja.name).toBe('Ninja');
    expect(ninja.katana?.name).toBe('Katana');
    expect(ninja.shuriken.name).toBe('DefaultShuriken');

    container.bind(Shuriken).toSelf();

    ninja = container.get(Ninja);

    expect(ninja.name).toBe('Ninja');
    expect(ninja.katana?.name).toBe('Katana');
    expect(ninja.shuriken.name).toBe('Shuriken');
  });
});
