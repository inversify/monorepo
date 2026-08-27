import { resolve } from 'rflct';
import { describe, expect, it } from 'vitest';

import {
  type BindingConstraints,
  Container,
  type Inject,
  type Injectable,
  type InjectNamed,
  type InjectTagged,
  type InjectUnmanaged,
  type MetadataName,
  type ServiceIdentifier,
} from '../../index.js';

describe('Bugs', () => {
  it('Should not throw when args length of base and derived class match (property setter)', () => {
    class Warrior implements Injectable {
      public rank: string | null;
      constructor() {
        // length = 0
        this.rank = null;
      }
    }

    class SamuraiMaster extends Warrior implements Injectable {
      constructor() {
        // length = 0
        super();
        this.rank = 'master';
      }
    }

    const container: Container = new Container();
    container.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);
    const master: SamuraiMaster = container.get<SamuraiMaster>(SamuraiMaster);

    expect(master.rank).eql('master');
  });

  it('Should not throw when args length of base and derived class match', () => {
    // Injecting into the derived class

    type Rank = string;

    class Warrior implements Injectable {
      protected rank: string;
      constructor(rank: string) {
        // length = 1
        this.rank = rank;
      }
    }

    class SamuraiMaster extends Warrior implements Injectable {
      constructor(
        public override rank: InjectNamed<Rank, 'master'>, // length = 1
      ) {
        super(rank);
      }
    }

    const container: Container = new Container();
    container.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);
    container
      .bind(resolve<Rank>())
      .toConstantValue('master')
      .whenNamed('master');

    const master: SamuraiMaster = container.get<SamuraiMaster>(SamuraiMaster);

    expect(master.rank).toBe('master');
  });

  it('Should not throw when args length of base and derived class match (multiple args)', () => {
    type Rank = string;

    class Warrior implements Injectable {
      protected rank: string;
      constructor(rank: string) {
        // length = 1
        this.rank = rank;
      }
    }

    interface Weapon {
      name: string;
    }

    class Katana implements Weapon, Injectable {
      public name: string;
      constructor() {
        this.name = 'Katana';
      }
    }

    class SamuraiMaster extends Warrior implements Injectable {
      public weapon: Weapon;
      constructor(
        public override rank: InjectNamed<Rank, 'master'>,
        weapon: Inject<Weapon>,
      ) {
        // length = 2
        super(rank);
        this.weapon = weapon;
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Weapon>()).to(Katana);
    container.bind<SamuraiMaster>(SamuraiMaster).to(SamuraiMaster);
    container
      .bind(resolve<Rank>())
      .toConstantValue('master')
      .whenNamed('master');

    const master: SamuraiMaster = container.get<SamuraiMaster>(SamuraiMaster);

    expect(master.rank).toBe('master');
    expect(master.weapon.name).toBe('Katana');
  });

  it('Should be able to convert a Symbol value to a string', () => {
    type Weapon = unknown;

    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Weapon: Symbol.for('Weapon'),
    };

    const container: Container = new Container();
    const throwF: () => void = () => {
      container.get<Weapon>(TYPES.Weapon);
    };

    expect(throwF).to.throw('');
  });

  it('Should be able to combine tagged injection and constant value bindings', () => {
    const container: Container = new Container();

    type Intl = unknown;

    container
      .bind<Intl>('Intl')
      .toConstantValue({ hello: 'bonjour' })
      .whenTagged('lang', 'fr');
    container
      .bind<Intl>('Intl')
      .toConstantValue({ goodbye: 'au revoir' })
      .whenTagged('lang', 'fr');

    const f: () => void = function () {
      container.get<Intl>('Intl', {
        tag: {
          key: 'lang',
          value: 'fr',
        },
      });
    };

    expect(f).toThrow(`Ambiguous bindings found for service: "Intl".

Registered bindings:

[ type: "ConstantValue", serviceIdentifier: "Intl", scope: "Singleton" ]
[ type: "ConstantValue", serviceIdentifier: "Intl", scope: "Singleton" ]

Trying to resolve bindings for "Intl (Root service)".

Binding constraints:
- service identifier: Intl
- name: -
- tags:
  - lang`);
  });

  it('Should be able to combine dynamic value with singleton scope', () => {
    const container: Container = new Container();

    container
      .bind<number>('transient_random')
      .toDynamicValue(() => Math.random())
      .inTransientScope();

    container
      .bind<number>('singleton_random')
      .toDynamicValue(() => Math.random())
      .inSingletonScope();

    const a: number = container.get<number>('transient_random');
    const b: number = container.get<number>('transient_random');

    expect(a).not.toBe(b);

    const c: number = container.get<number>('singleton_random');
    const d: number = container.get<number>('singleton_random');

    expect(c).toBe(d);
  });

  it('Should be able to use an abstract class as the serviceIdentifier', () => {
    abstract class Animal implements Injectable {
      protected name: string;
      constructor(name: InjectUnmanaged<string>) {
        this.name = name;
      }
      public move(meters: number) {
        return `${this.name} moved ${meters.toString()}m`;
      }
      public abstract makeSound(input: string): string;
    }

    class Snake extends Animal implements Injectable {
      constructor() {
        super('Snake');
      }
      public makeSound(input: string): string {
        return 'sssss' + input;
      }
      public override move() {
        return 'Slithering... ' + super.move(5);
      }
    }

    class Jungle implements Injectable {
      public animal: Animal;
      constructor(animal: Inject<Animal>) {
        this.animal = animal;
      }
    }

    const container: Container = new Container();
    container.bind<Animal>(Animal).to(Snake);
    container.bind<Jungle>(Jungle).to(Jungle);

    const jungle: Jungle = container.get(Jungle);

    expect(jungle.animal.makeSound('zzz')).toBe('ssssszzz');

    expect(jungle.animal.move(5)).toBe('Slithering... Snake moved 5m');
  });

  it('Should not be able to get a named dependency if no named bindings are registered', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Weapon: 'Weapon',
    };

    interface Weapon {
      name: string;
    }

    class Katana implements Weapon, Injectable {
      public name: string;
      constructor() {
        this.name = 'Katana';
      }
    }

    const container: Container = new Container();
    container.bind<Weapon>(TYPES.Weapon).to(Katana).whenNamed('sword');

    const throws: () => void = () => {
      container.get<Weapon>(TYPES.Weapon, {
        name: 'bow',
      });
    };

    const error: string = `No bindings found for service: "Weapon".

Trying to resolve bindings for "Weapon (Root service)"`;

    expect(throws).toThrow(error);
  });

  it('Should throw a friendly error when binding a non-class using toSelf', () => {
    const container: Container = new Container();
    const throws: () => void = () => {
      container.bind('testId').toSelf();
    };

    expect(throws).toThrow(
      'function can only be applied when a newable function is used as service identifier',
    );
  });

  it('Should be able to inject into an abstract class', () => {
    type Weapon = unknown;

    abstract class BaseSoldier implements Injectable {
      public weapon: Weapon;
      constructor(weapon: Inject<Weapon>) {
        this.weapon = weapon;
      }
    }

    class Soldier extends BaseSoldier implements Injectable {}

    class Archer extends BaseSoldier implements Injectable {}

    class Knight extends BaseSoldier implements Injectable {}

    class Sword implements Injectable {}

    class Bow implements Injectable {}

    class DefaultWeapon implements Injectable {}

    const container: Container = new Container();

    const weaponId = resolve<Weapon>();
    const baseSoldierId = resolve<BaseSoldier>();

    function whenIsAndIsNamed(
      serviceIdentifier: ServiceIdentifier,
      name: MetadataName,
    ): (bindingConstraints: BindingConstraints) => boolean {
      return (bindingConstraints: BindingConstraints): boolean =>
        bindingConstraints.serviceIdentifier === serviceIdentifier &&
        bindingConstraints.name === name;
    }

    container
      .bind(weaponId)
      .to(DefaultWeapon)
      .whenParent(whenIsAndIsNamed(baseSoldierId, 'default'));
    container
      .bind(weaponId)
      .to(Sword)
      .whenParent(whenIsAndIsNamed(baseSoldierId, 'knight'));
    container
      .bind(weaponId)
      .to(Bow)
      .whenParent(whenIsAndIsNamed(baseSoldierId, 'archer'));
    container.bind(baseSoldierId).to(Soldier).whenNamed('default');
    container.bind(baseSoldierId).to(Knight).whenNamed('knight');
    container.bind(baseSoldierId).to(Archer).whenNamed('archer');

    const soldier: BaseSoldier = container.get(baseSoldierId, {
      name: 'default',
    });
    const knight: BaseSoldier = container.get(baseSoldierId, {
      name: 'knight',
    });
    const archer: BaseSoldier = container.get(baseSoldierId, {
      name: 'archer',
    });

    expect(soldier.weapon instanceof DefaultWeapon).toBe(true);
    expect(knight.weapon instanceof Sword).toBe(true);
    expect(archer.weapon instanceof Bow).toBe(true);
  });

  it('Should be able apply inject to property shortcut', () => {
    interface Weapon {
      use(): string;
    }

    class Katana implements Weapon, Injectable {
      public use() {
        return 'Used Katana!';
      }
    }

    class Ninja implements Injectable {
      constructor(
        private readonly _weapon: InjectNamed<Weapon, 'sword'>,
      ) {
        //
      }
      public fight() {
        return this._weapon.use();
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Weapon>()).to(Katana).whenNamed('sword');
    container.bind<Ninja>(Ninja).toSelf();

    const ninja: Ninja = container.get<Ninja>(Ninja);

    expect(ninja.fight()).toBe('Used Katana!');
  });

  it('Should be able to inject into abstract base class without decorators', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Warrior: 'Warrior',
      Weapon: 'Weapon',
    };

    // eslint-disable-next-line @typescript-eslint/typedef
    const TAGS = {
      Primary: 'Primary',
      Priority: 'Priority',
      Secondary: 'Secondary',
    };

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

    abstract class BaseWarrior implements Warrior, Injectable {
      public name: string;
      public primaryWeapon!: InjectTagged<Weapon, 'Priority', 'Primary'>;

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
      .whenTagged(TAGS.Priority, TAGS.Primary);
    container
      .bind(resolve<Weapon>())
      .to(Shuriken)
      .whenTagged(TAGS.Priority, TAGS.Secondary);

    const samurai = container.get(resolve<Warrior>()) as Samurai;

    expect(samurai.name).toBe('Samurai');
    expect(samurai.secondaryWeapon).toBeDefined();
    expect(samurai.secondaryWeapon.name).toBe('Shuriken');
    expect(samurai.primaryWeapon).toBeDefined();
    expect(samurai.primaryWeapon.name).toBe('Katana');
  });

  it('Should be able to combine unmanaged and managed injections ', () => {
    interface Model<T> {
      instance: T;
    }

    interface RepoBaseInterface<T> {
      model: Model<T>;
    }

    class Type {
      public name: string;
      constructor() {
        this.name = 'Type';
      }
    }

    class RepoBase<T> implements RepoBaseInterface<T>, Injectable {
      public model: Model<T>;

      constructor(
        // using InjectUnmanaged here is right
        // because entityType is NOT Injected by inversify
        entityType: InjectUnmanaged<new () => T>,
      ) {
        this.model = { instance: new entityType() };
      }
    }

    class TypedRepo extends RepoBase<Type> implements Injectable {
      constructor() {
        super(Type); // unmanaged injection (NOT Injected by inversify)
      }
    }

    class BlBase<T> implements Injectable {
      public repository: RepoBaseInterface<T>;

      constructor(
        // using InjectUnmanaged here would wrong
        // because repository is injected by inversify
        repository: RepoBaseInterface<T>,
      ) {
        this.repository = repository;
      }
    }

    class TypedBl extends BlBase<Type> implements Injectable {
      // eslint-disable-next-line @typescript-eslint/no-useless-constructor
      constructor(repository: Inject<TypedRepo>) {
        super(repository);
      }
    }

    const container: Container = new Container();
    container.bind<TypedRepo>(TypedRepo).toSelf();
    container.bind(resolve<TypedBl>()).to(TypedBl);

    const typedBl: TypedBl = container.get(resolve<TypedBl>());

    expect(typedBl.repository.model.instance.name).toBe(new Type().name);
  });

  it('Should allow missing annotations in base classes', () => {
    class Katana implements Injectable {
      public hit() {
        return 'cut!';
      }
    }

    abstract class Warrior {
      private readonly _katana: Katana;

      constructor(katana: InjectUnmanaged<Katana>) {
        this._katana = katana;
      }

      public fight() {
        return this._katana.hit();
      }
    }

    class Ninja extends Warrior implements Injectable {
      constructor(katana: Inject<Katana>) {
        super(katana);
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Ninja>()).to(Ninja);
    container.bind(resolve<Katana>()).to(Katana);

    const tryGet: () => void = () => {
      container.get(resolve<Ninja>());
    };

    expect(tryGet).not.toThrow();
  });
});
