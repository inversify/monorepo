import { describe, expect, it } from 'vitest';

import {
  bindingScopeValues,
  Container,
  inject,
  injectable,
  postConstruct,
  ResolutionContext,
} from '../..';

describe(Container, () => {
  it('Should unbind a binding when requested', async () => {
    @injectable()
    class Ninja {}
    const ninjaId: string = 'Ninja';

    const container: Container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);

    await container.unbind(ninjaId);

    expect(container.isBound(ninjaId)).toBe(false);
  });

  it('Should unbind a binding when requested and avoid unbinding a binding when not requested', async () => {
    @injectable()
    class Ninja {}

    @injectable()
    class Samurai {}

    const ninjaId: string = 'Ninja';
    const samuraiId: string = 'Samurai';

    const container: Container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Samurai>(samuraiId).to(Samurai);

    expect(container.isBound(ninjaId)).toBe(true);
    expect(container.isBound(samuraiId)).toBe(true);

    await container.unbind(ninjaId);

    expect(container.isBound(ninjaId)).toBe(false);
    expect(container.isBound(samuraiId)).toBe(true);
  });

  it('Should be able unbound all dependencies', async () => {
    @injectable()
    class Ninja {}

    @injectable()
    class Samurai {}

    const ninjaId: string = 'Ninja';
    const samuraiId: string = 'Samurai';

    const container: Container = new Container();
    container.bind<Ninja>(ninjaId).to(Ninja);
    container.bind<Samurai>(samuraiId).to(Samurai);

    expect(container.isBound(ninjaId)).toBe(true);
    expect(container.isBound(samuraiId)).toBe(true);

    await container.unbindAll();

    expect(container.isBound(ninjaId)).toBe(false);
    expect(container.isBound(samuraiId)).toBe(false);
  });

  it('Should NOT be able to get unregistered services', () => {
    @injectable()
    class Ninja {}
    const ninjaId: string = 'Ninja';

    const container: Container = new Container();
    const throwFunction: () => void = () => {
      container.get<Ninja>(ninjaId);
    };

    expect(throwFunction).toThrow(`No bindings found for service: "Ninja".

Trying to resolve bindings for "Ninja (Root service)".

Binding constraints:
- service identifier: Ninja
- name: -`);
  });

  it('Should NOT be able to get ambiguous match', () => {
    type Warrior = unknown;

    @injectable()
    class Ninja {}

    @injectable()
    class Samurai {}

    const warriorId: string = 'Warrior';

    const container: Container = new Container();
    container.bind<Warrior>(warriorId).to(Ninja);
    container.bind<Warrior>(warriorId).to(Samurai);

    const throwFunction: () => void = () => {
      container.get<Warrior>(warriorId);
    };

    expect(throwFunction)
      .toThrow(`Ambiguous bindings found for service: "Warrior".

Registered bindings:

[ type: "Instance", serviceIdentifier: "Warrior", scope: "Transient", implementationType: "Ninja" ]
[ type: "Instance", serviceIdentifier: "Warrior", scope: "Transient", implementationType: "Samurai" ]

Trying to resolve bindings for "Warrior (Root service)".

Binding constraints:
- service identifier: Warrior
- name: -`);
  });

  it('Should be able to getAll of unregistered services', () => {
    @injectable()
    class Ninja {}
    const ninjaId: string = 'Ninja';

    const container: Container = new Container();

    expect(container.getAll<Ninja>(ninjaId)).toStrictEqual([]);
  });

  it('Should be able to snapshot and restore container', async () => {
    @injectable()
    class Ninja {}

    @injectable()
    class Samurai {}

    const container: Container = new Container();
    container.bind(Ninja).to(Ninja);
    container.bind(Samurai).to(Samurai);

    expect(container.get(Samurai)).toBeInstanceOf(Samurai);
    expect(container.get(Ninja)).toBeInstanceOf(Ninja);

    container.snapshot(); // snapshot container = v1

    await container.unbind(Ninja);

    expect(container.get(Samurai)).toBeInstanceOf(Samurai);
    expect(() => container.get(Ninja))
      .toThrow(`No bindings found for service: "Ninja".

Trying to resolve bindings for "Ninja (Root service)".

Binding constraints:
- service identifier: Ninja
- name: -`);

    container.snapshot(); // snapshot container = v2

    expect(() => container.get(Ninja))
      .toThrow(`No bindings found for service: "Ninja".

Trying to resolve bindings for "Ninja (Root service)".

Binding constraints:
- service identifier: Ninja
- name: -`);

    container.bind(Ninja).to(Ninja);

    expect(container.get(Samurai)).toBeInstanceOf(Samurai);
    expect(container.get(Ninja)).toBeInstanceOf(Ninja);

    container.restore(); // restore container to v2

    expect(container.get(Samurai)).toBeInstanceOf(Samurai);
    expect(() => container.get(Ninja))
      .toThrow(`No bindings found for service: "Ninja".

Trying to resolve bindings for "Ninja (Root service)".

Binding constraints:
- service identifier: Ninja
- name: -`);

    container.restore(); // restore container to v1

    expect(container.get(Samurai)).toBeInstanceOf(Samurai);
    expect(container.get(Ninja)).toBeInstanceOf(Ninja);

    expect(() => {
      container.restore();
    }).to.throw('No snapshot available to restore');
  });

  it('Should maintain the activation state of a singleton when doing a snapshot of a container', () => {
    let timesCalled: number = 0;

    @injectable()
    class Ninja {
      @postConstruct()
      public postConstruct() {
        timesCalled++;
      }
    }

    const container: Container = new Container();

    container.bind<Ninja>(Ninja).to(Ninja).inSingletonScope();

    container.get<Ninja>(Ninja);
    container.snapshot();
    container.restore();
    container.get<Ninja>(Ninja);

    expect(timesCalled).toBe(1);
  });

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

  it('Should be able to check is there are bindings available for a given identifier', () => {
    const warriorId: string = 'Warrior';
    const warriorSymbol: symbol = Symbol.for('Warrior');

    @injectable()
    class Ninja {}

    const container: Container = new Container();
    container.bind(Ninja).to(Ninja);
    container.bind(warriorId).to(Ninja);
    container.bind(warriorSymbol).to(Ninja);

    expect(container.isBound(Ninja)).equal(true);
    expect(container.isBound(warriorId)).equal(true);
    expect(container.isBound(warriorSymbol)).equal(true);

    const katanaId: string = 'Katana';
    const katanaSymbol: symbol = Symbol.for('Katana');

    @injectable()
    class Katana {}

    expect(container.isBound(Katana)).equal(false);
    expect(container.isBound(katanaId)).equal(false);
    expect(container.isBound(katanaSymbol)).equal(false);
  });

  it('Should be able to check is there are bindings available for a given identifier only in current container', () => {
    @injectable()
    class Ninja {}

    const containerParent: Container = new Container();
    const containerChild: Container = new Container({
      parent: containerParent,
    });

    containerParent.bind(Ninja).to(Ninja);

    expect(containerParent.isBound(Ninja)).to.eql(true);
    expect(containerChild.isBound(Ninja)).to.eql(true);
    expect(containerChild.isCurrentBound(Ninja)).to.eql(false);
  });

  it('Should be able to get services from parent container', () => {
    const weaponIdentifier: string = 'Weapon';

    @injectable()
    class Katana {}

    const container: Container = new Container();
    container.bind(weaponIdentifier).to(Katana);

    const childContainer: Container = new Container({ parent: container });

    const secondChildContainer: Container = new Container({
      parent: childContainer,
    });

    expect(secondChildContainer.get(weaponIdentifier)).toBeInstanceOf(Katana);
  });

  it('Should be able to check if services are bound from parent container', () => {
    const weaponIdentifier: string = 'Weapon';

    @injectable()
    class Katana {}

    const container: Container = new Container();
    container.bind(weaponIdentifier).to(Katana);

    const childContainer: Container = new Container({ parent: container });

    const secondChildContainer: Container = new Container({
      parent: childContainer,
    });

    expect(secondChildContainer.isBound(weaponIdentifier)).toBe(true);
  });

  it('Should prioritize requested container to resolve a service identifier', () => {
    const weaponIdentifier: string = 'Weapon';

    @injectable()
    class Katana {}

    @injectable()
    class DivineRapier {}

    const container: Container = new Container();
    container.bind(weaponIdentifier).to(Katana);

    const childContainer: Container = new Container({ parent: container });

    const secondChildContainer: Container = new Container({
      parent: childContainer,
    });
    secondChildContainer.bind(weaponIdentifier).to(DivineRapier);

    expect(secondChildContainer.get(weaponIdentifier)).toBeInstanceOf(
      DivineRapier,
    );
  });

  it('Should be able to resolve named multi-injection', () => {
    interface Intl {
      hello?: string;
      goodbye?: string;
    }

    const container: Container = new Container();
    container
      .bind<Intl>('Intl')
      .toConstantValue({ hello: 'bonjour' })
      .whenNamed('fr');
    container
      .bind<Intl>('Intl')
      .toConstantValue({ goodbye: 'au revoir' })
      .whenNamed('fr');
    container
      .bind<Intl>('Intl')
      .toConstantValue({ hello: 'hola' })
      .whenNamed('es');
    container
      .bind<Intl>('Intl')
      .toConstantValue({ goodbye: 'adios' })
      .whenNamed('es');

    const fr: Intl[] = container.getAll<Intl>('Intl', { name: 'fr' });

    expect(fr).toHaveLength(2);
    expect(fr[0]?.hello).toBe('bonjour');
    expect(fr[1]?.goodbye).toBe('au revoir');

    const es: Intl[] = container.getAll<Intl>('Intl', { name: 'es' });

    expect(es).toHaveLength(2);
    expect(es[0]?.hello).toBe('hola');
    expect(es[1]?.goodbye).toBe('adios');
  });

  it('Should be able to resolve tagged multi-injection', () => {
    interface Intl {
      hello?: string;
      goodbye?: string;
    }

    const container: Container = new Container();
    container
      .bind<Intl>('Intl')
      .toConstantValue({ hello: 'bonjour' })
      .whenTagged('lang', 'fr');
    container
      .bind<Intl>('Intl')
      .toConstantValue({ goodbye: 'au revoir' })
      .whenTagged('lang', 'fr');
    container
      .bind<Intl>('Intl')
      .toConstantValue({ hello: 'hola' })
      .whenTagged('lang', 'es');
    container
      .bind<Intl>('Intl')
      .toConstantValue({ goodbye: 'adios' })
      .whenTagged('lang', 'es');

    const fr: Intl[] = container.getAll<Intl>('Intl', {
      tag: { key: 'lang', value: 'fr' },
    });

    expect(fr).toHaveLength(2);
    expect(fr[0]?.hello).toBe('bonjour');
    expect(fr[1]?.goodbye).toBe('au revoir');

    const es: Intl[] = container.getAll<Intl>('Intl', {
      tag: { key: 'lang', value: 'es' },
    });

    expect(es).toHaveLength(2);
    expect(es[0]?.hello).toBe('hola');
    expect(es[1]?.goodbye).toBe('adios');
  });

  it('Should be able to resolve optional injection', async () => {
    const container: Container = new Container();

    const serviceIdentifier: string = 'service-id';

    expect(
      container.get(serviceIdentifier, { optional: true }),
    ).toBeUndefined();
    expect(
      container.getAll(serviceIdentifier, { optional: true }),
    ).toStrictEqual([]);
    await expect(
      container.getAllAsync(serviceIdentifier, { optional: true }),
    ).resolves.toStrictEqual([]);
    expect(
      container.getAll(serviceIdentifier, {
        name: 'name',
        optional: true,
      }),
    ).toStrictEqual([]);
    await expect(
      container.getAllAsync(serviceIdentifier, {
        name: 'name',
        optional: true,
      }),
    ).resolves.toStrictEqual([]);
    expect(
      container.getAll(serviceIdentifier, {
        optional: true,
        tag: { key: 'tag', value: 'value' },
      }),
    ).toStrictEqual([]);
    await expect(
      container.getAllAsync(serviceIdentifier, {
        optional: true,
        tag: { key: 'tag', value: 'value' },
      }),
    ).resolves.toStrictEqual([]);
    await expect(
      container.getAsync(serviceIdentifier, {
        optional: true,
      }),
    ).resolves.toBeUndefined();
    expect(
      container.get(serviceIdentifier, {
        name: 'name',
        optional: true,
      }),
    ).toBeUndefined();
    await expect(
      container.getAsync(serviceIdentifier, {
        name: 'name',
        optional: true,
      }),
    ).resolves.toBeUndefined();
    expect(
      container.get(serviceIdentifier, {
        optional: true,
        tag: { key: 'tag', value: 'value' },
      }),
    ).toBeUndefined();
    await expect(
      container.getAsync(serviceIdentifier, {
        optional: true,
        tag: { key: 'tag', value: 'value' },
      }),
    ).resolves.toBeUndefined();
  });

  it('Should be able configure the default scope at a global level', () => {
    interface Warrior {
      health: number;
      takeHit(damage: number): void;
    }

    @injectable()
    class Ninja implements Warrior {
      public health: number;
      constructor() {
        this.health = 100;
      }
      public takeHit(damage: number) {
        this.health = this.health - damage;
      }
    }

    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Warrior: 'Warrior',
    };

    const container1: Container = new Container();
    container1.bind<Warrior>(TYPES.Warrior).to(Ninja);

    const transientNinja1: Warrior = container1.get<Warrior>(TYPES.Warrior);

    expect(transientNinja1.health).toBe(100);

    transientNinja1.takeHit(10);

    expect(transientNinja1.health).toBe(90);

    const transientNinja2: Warrior = container1.get<Warrior>(TYPES.Warrior);

    expect(transientNinja2.health).toBe(100);

    transientNinja2.takeHit(10);

    expect(transientNinja2.health).toBe(90);

    const container2: Container = new Container({
      defaultScope: bindingScopeValues.Singleton,
    });
    container2.bind<Warrior>(TYPES.Warrior).to(Ninja);

    const singletonNinja1: Warrior = container2.get<Warrior>(TYPES.Warrior);

    expect(singletonNinja1.health).toBe(100);

    singletonNinja1.takeHit(10);

    expect(singletonNinja1.health).toBe(90);

    const singletonNinja2: Warrior = container2.get<Warrior>(TYPES.Warrior);

    expect(singletonNinja2.health).toBe(90);

    singletonNinja2.takeHit(10);

    expect(singletonNinja2.health).toBe(80);
  });

  it('Should be able to override options to child containers', () => {
    @injectable()
    class Warrior {}

    const parent: Container = new Container({
      defaultScope: bindingScopeValues.Request,
    });

    const child: Container = new Container({
      defaultScope: bindingScopeValues.Singleton,
      parent,
    });

    child.bind(Warrior).toSelf();

    const singletonWarrior1: Warrior = child.get(Warrior);
    const singletonWarrior2: Warrior = child.get(Warrior);

    expect(singletonWarrior1).toBe(singletonWarrior2);
  });

  it('Should be able check if a named binding is bound', async () => {
    const zero: string = 'Zero';
    const invalidDivisor: string = 'InvalidDivisor';
    const validDivisor: string = 'ValidDivisor';
    const container: Container = new Container();

    expect(container.isBound(zero)).toBe(false);

    container.bind<number>(zero).toConstantValue(0);

    expect(container.isBound(zero)).toBe(true);

    await container.unbindAll();

    expect(container.isBound(zero)).toBe(false);

    container.bind<number>(zero).toConstantValue(0).whenNamed(invalidDivisor);

    expect(container.isBound(zero, { name: invalidDivisor })).toBe(true);
    expect(container.isBound(zero, { name: validDivisor })).toBe(false);

    container.bind<number>(zero).toConstantValue(1).whenNamed(validDivisor);

    expect(container.isBound(zero, { name: invalidDivisor })).toBe(true);
    expect(container.isBound(zero, { name: validDivisor })).toBe(true);
  });

  it('Should be able to check if a named binding is bound from parent container', () => {
    const zero: string = 'Zero';
    const invalidDivisor: string = 'InvalidDivisor';
    const validDivisor: string = 'ValidDivisor';
    const container: Container = new Container();
    const childContainer: Container = new Container({ parent: container });
    const secondChildContainer: Container = new Container({
      parent: childContainer,
    });

    container.bind<number>(zero).toConstantValue(0).whenNamed(invalidDivisor);

    expect(
      secondChildContainer.isBound(zero, { name: invalidDivisor }),
    ).to.equal(true);
    expect(secondChildContainer.isBound(zero, { name: validDivisor })).toBe(
      false,
    );

    container.bind<number>(zero).toConstantValue(1).whenNamed(validDivisor);

    expect(secondChildContainer.isBound(zero, { name: invalidDivisor })).toBe(
      true,
    );
    expect(secondChildContainer.isBound(zero, { name: validDivisor })).to.equal(
      true,
    );
  });

  it('Should be able to get a tagged binding', () => {
    const zero: string = 'Zero';
    const isValidDivisor: string = 'IsValidDivisor';
    const container: Container = new Container();

    container
      .bind<number>(zero)
      .toConstantValue(0)
      .whenTagged(isValidDivisor, false);

    expect(
      container.get(zero, {
        tag: { key: isValidDivisor, value: false },
      }),
    ).toBe(0);

    container
      .bind<number>(zero)
      .toConstantValue(1)
      .whenTagged(isValidDivisor, true);

    expect(
      container.get(zero, {
        tag: { key: isValidDivisor, value: false },
      }),
    ).toBe(0);
    expect(
      container.get(zero, {
        tag: { key: isValidDivisor, value: true },
      }),
    ).toBe(1);
  });

  it('Should be able to get a tagged binding from parent container', () => {
    const zero: string = 'Zero';
    const isValidDivisor: string = 'IsValidDivisor';
    const container: Container = new Container();
    const childContainer: Container = new Container({ parent: container });
    const secondChildContainer: Container = new Container({
      parent: childContainer,
    });

    container
      .bind<number>(zero)
      .toConstantValue(0)
      .whenTagged(isValidDivisor, false);
    container
      .bind<number>(zero)
      .toConstantValue(1)
      .whenTagged(isValidDivisor, true);

    expect(
      secondChildContainer.get(zero, {
        tag: { key: isValidDivisor, value: false },
      }),
    ).toBe(0);
    expect(
      secondChildContainer.get(zero, {
        tag: { key: isValidDivisor, value: true },
      }),
    ).toBe(1);
  });

  it('Should be able check if a tagged binding is bound', async () => {
    const zero: string = 'Zero';
    const isValidDivisor: string = 'IsValidDivisor';
    const container: Container = new Container();

    expect(container.isBound(zero)).toBe(false);

    container.bind<number>(zero).toConstantValue(0);

    expect(container.isBound(zero)).toBe(true);

    await container.unbindAll();

    expect(container.isBound(zero)).toBe(false);

    container
      .bind<number>(zero)
      .toConstantValue(0)
      .whenTagged(isValidDivisor, false);

    expect(
      container.isBound(zero, {
        tag: { key: isValidDivisor, value: false },
      }),
    ).toBe(true);
    expect(
      container.isBound(zero, {
        tag: { key: isValidDivisor, value: true },
      }),
    ).toBe(false);

    container
      .bind<number>(zero)
      .toConstantValue(1)
      .whenTagged(isValidDivisor, true);

    expect(
      container.isBound(zero, {
        tag: { key: isValidDivisor, value: false },
      }),
    ).toBe(true);
    expect(
      container.isBound(zero, {
        tag: { key: isValidDivisor, value: true },
      }),
    ).toBe(true);
  });

  it('Should be able to check if a tagged binding is bound from parent container', () => {
    const zero: string = 'Zero';
    const isValidDivisor: string = 'IsValidDivisor';
    const container: Container = new Container();
    const childContainer: Container = new Container({ parent: container });
    const secondChildContainer: Container = new Container({
      parent: childContainer,
    });

    container
      .bind<number>(zero)
      .toConstantValue(0)
      .whenTagged(isValidDivisor, false);

    expect(
      secondChildContainer.isBound(zero, {
        tag: { key: isValidDivisor, value: false },
      }),
    ).toBe(true);
    expect(
      secondChildContainer.isBound(zero, {
        tag: { key: isValidDivisor, value: true },
      }),
    ).toBe(false);

    container
      .bind<number>(zero)
      .toConstantValue(1)
      .whenTagged(isValidDivisor, true);

    expect(
      secondChildContainer.isBound(zero, {
        tag: { key: isValidDivisor, value: false },
      }),
    ).toBe(true);
    expect(
      secondChildContainer.isBound(zero, {
        tag: { key: isValidDivisor, value: true },
      }),
    ).toBe(true);
  });

  it('Should be able to override a binding using rebind', async () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      someType: 'someType',
    };

    const container: Container = new Container();
    container.bind<number>(TYPES.someType).toConstantValue(1);

    container.bind<number>(TYPES.someType).toConstantValue(2);

    const values1: unknown[] = container.getAll(TYPES.someType);

    expect(values1[0]).toBe(1);

    expect(values1[1]).toBe(2);

    await container.unbind(TYPES.someType);

    container.bind<number>(TYPES.someType).toConstantValue(3);
    const values2: unknown[] = container.getAll(TYPES.someType);

    expect(values2[0]).toBe(3);
    expect(values2[1]).toBeUndefined();
  });

  it('Should be able to resolve named multi-injection (async)', async () => {
    interface Intl {
      hello?: string;
      goodbye?: string;
    }

    const container: Container = new Container();
    container
      .bind<Intl>('Intl')
      .toDynamicValue(async () => Promise.resolve({ hello: 'bonjour' }))
      .whenNamed('fr');
    container
      .bind<Intl>('Intl')
      .toDynamicValue(async () => Promise.resolve({ goodbye: 'au revoir' }))
      .whenNamed('fr');
    container
      .bind<Intl>('Intl')
      .toDynamicValue(async () => Promise.resolve({ hello: 'hola' }))
      .whenNamed('es');
    container
      .bind<Intl>('Intl')
      .toDynamicValue(async () => Promise.resolve({ goodbye: 'adios' }))
      .whenNamed('es');

    const fr: Intl[] = await container.getAllAsync<Intl>('Intl', {
      name: 'fr',
    });

    expect(fr.length).to.equal(2);
    expect(fr[0]?.hello).to.equal('bonjour');
    expect(fr[1]?.goodbye).to.equal('au revoir');

    const es: Intl[] = await container.getAllAsync<Intl>('Intl', {
      name: 'es',
    });

    expect(es.length).to.equal(2);
    expect(es[0]?.hello).to.equal('hola');
    expect(es[1]?.goodbye).to.equal('adios');
  });

  it('Should be able to resolve named (async)', async () => {
    interface Intl {
      hello?: string;
      goodbye?: string;
    }

    const container: Container = new Container();
    container
      .bind<Intl>('Intl')
      .toDynamicValue(async () => Promise.resolve({ hello: 'bonjour' }))
      .whenNamed('fr');
    container
      .bind<Intl>('Intl')
      .toDynamicValue(async () => Promise.resolve({ hello: 'hola' }))
      .whenNamed('es');

    const fr: Intl = await container.getAsync<Intl>('Intl', { name: 'fr' });
    const es: Intl = await container.getAsync<Intl>('Intl', { name: 'es' });

    expect(fr.hello).toBe('bonjour');
    expect(es.hello).toBe('hola');
  });

  it('Should be able to resolve tagged multi-injection (async)', async () => {
    interface Intl {
      hello?: string;
      goodbye?: string;
    }

    const container: Container = new Container();
    container
      .bind<Intl>('Intl')
      .toDynamicValue(async () => Promise.resolve({ hello: 'bonjour' }))
      .whenTagged('lang', 'fr');
    container
      .bind<Intl>('Intl')
      .toDynamicValue(async () => Promise.resolve({ goodbye: 'au revoir' }))
      .whenTagged('lang', 'fr');
    container
      .bind<Intl>('Intl')
      .toDynamicValue(async () => Promise.resolve({ hello: 'hola' }))
      .whenTagged('lang', 'es');
    container
      .bind<Intl>('Intl')
      .toDynamicValue(async () => Promise.resolve({ goodbye: 'adios' }))
      .whenTagged('lang', 'es');

    const fr: Intl[] = await container.getAllAsync<Intl>('Intl', {
      tag: { key: 'lang', value: 'fr' },
    });

    expect(fr).toHaveLength(2);
    expect(fr[0]?.hello).toBe('bonjour');
    expect(fr[1]?.goodbye).toBe('au revoir');

    const es: Intl[] = await container.getAllAsync<Intl>('Intl', {
      tag: { key: 'lang', value: 'es' },
    });

    expect(es).toHaveLength(2);
    expect(es[0]?.hello).toBe('hola');
    expect(es[1]?.goodbye).toBe('adios');
  });

  it('Should be able to get a tagged binding (async)', async () => {
    const zero: string = 'Zero';
    const isValidDivisor: string = 'IsValidDivisor';
    const container: Container = new Container();

    container
      .bind<number>(zero)
      .toDynamicValue(async () => Promise.resolve(0))
      .whenTagged(isValidDivisor, false);

    await expect(
      container.getAsync(zero, {
        tag: { key: isValidDivisor, value: false },
      }),
    ).resolves.toBe(0);

    container
      .bind<number>(zero)
      .toDynamicValue(async () => Promise.resolve(1))
      .whenTagged(isValidDivisor, true);

    await expect(
      container.getAsync(zero, {
        tag: { key: isValidDivisor, value: false },
      }),
    ).resolves.toBe(0);
    await expect(
      container.getAsync(zero, {
        tag: { key: isValidDivisor, value: true },
      }),
    ).resolves.toBe(1);
  });

  it('should be able to get all the services binded (async)', async () => {
    const serviceIdentifier: string = 'service-identifier';

    const container: Container = new Container();

    const firstValueBinded: string = 'value-one';
    const secondValueBinded: string = 'value-two';
    const thirdValueBinded: string = 'value-three';

    container.bind(serviceIdentifier).toConstantValue(firstValueBinded);
    container.bind(serviceIdentifier).toConstantValue(secondValueBinded);
    container
      .bind(serviceIdentifier)
      .toDynamicValue(async (_: ResolutionContext) =>
        Promise.resolve(thirdValueBinded),
      );
    const services: string[] =
      await container.getAllAsync<string>(serviceIdentifier);

    expect(services).toStrictEqual([
      firstValueBinded,
      secondValueBinded,
      thirdValueBinded,
    ]);
  });

  it('Should be able to inject when symbol property key ', () => {
    const weaponProperty: unique symbol = Symbol();
    type Weapon = unknown;
    @injectable()
    class Shuriken {}
    @injectable()
    class Ninja {
      @inject('Weapon')
      public [weaponProperty]!: Weapon;
    }
    const container: Container = new Container();
    container.bind('Weapon').to(Shuriken);

    container.bind(Ninja).toSelf();

    const myNinja: Ninja = container.get(Ninja);
    const weapon: Weapon = myNinja[weaponProperty];

    expect(weapon).toBeInstanceOf(Shuriken);
  });
});
