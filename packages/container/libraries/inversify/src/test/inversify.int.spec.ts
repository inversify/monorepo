import { describe, expect, expectTypeOf, it } from 'vitest';
import { resolve } from 'rflct';

import {
  BindingConstraints,
  Container,
  ContainerModule,
  type ContainerModuleLoadOptions,
  type Inject,
  type Injectable,
  type InjectMulti,
  type InjectNamed,
  type InjectTagged,
  Newable,
  type ResolutionContext,
} from '../index.js';

describe('InversifyJS', () => {
  it('Should be able to resolve and inject dependencies', () => {
    interface NinjaInterface {
      fight(): string;
      sneak(): string;
    }

    interface KatanaInterface {
      hit(): string;
    }

    interface ShurikenInterface {
      throw(): string;
    }

    class Katana implements KatanaInterface, Injectable {
      public hit() {
        return 'cut!';
      }
    }

    class Shuriken implements ShurikenInterface, Injectable {
      public throw() {
        return 'hit!';
      }
    }

    class Ninja implements NinjaInterface, Injectable {
      private readonly _katana: KatanaInterface;
      private readonly _shuriken: ShurikenInterface;

      constructor(
        katana: KatanaInterface,
        shuriken: ShurikenInterface,
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.bind(resolve<NinjaInterface>()).to(Ninja);
    container.bind(resolve<KatanaInterface>()).to(Katana);
    container.bind(resolve<ShurikenInterface>()).to(Shuriken);

    const ninja: NinjaInterface = container.get(resolve<NinjaInterface>());

    expect(ninja.fight()).toBe('cut!');
    expect(ninja.sneak()).toBe('hit!');
  });

  it('Should be able to do setter injection and property injection', () => {
    class Shuriken implements Injectable {
      public throw() {
        return 'hit!';
      }
    }
    class Katana implements Katana, Injectable {
      public hit() {
        return 'cut!';
      }
    }

    class Ninja implements Injectable {
      public katana!: Inject<Katana>;

      private _shuriken!: Shuriken;
      public set Shuriken(shuriken: Inject<Shuriken>) {
        this._shuriken = shuriken;
      }

      public sneak() {
        return this._shuriken.throw();
      }
      public fight() {
        return this.katana.hit();
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Ninja>()).to(Ninja);
    container.bind(Shuriken).toSelf();
    container.bind(Katana).toSelf();

    const ninja: Ninja = container.get(resolve<Ninja>());

    expect(ninja.sneak()).toBe('hit!');
    expect(ninja.fight()).toBe('cut!');
  });

  it('Should be able to resolve and inject dependencies in VanillaJS', () => {
    interface BlowgunInterface {
      blow(): string;
    }

    interface KatanaInterface {
      hit(): string;
    }

    interface ShurikenInterface {
      throw(): string;
    }

    class Blowgun implements BlowgunInterface, Injectable {
      public blow() {
        return 'poison!';
      }
    }

    class Katana implements KatanaInterface, Injectable {
      public hit() {
        return 'cut!';
      }
    }

    class Shuriken implements ShurikenInterface, Injectable {
      public throw() {
        return 'hit!';
      }
    }

    class Ninja implements Injectable {
      public _katana: KatanaInterface;
      public _shuriken: ShurikenInterface;
      public _blowgun!: BlowgunInterface;

      constructor(katana: KatanaInterface, shuriken: ShurikenInterface) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public set blowgun(blowgun: Inject<BlowgunInterface>) {
        this._blowgun = blowgun;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
      public poisonDart() {
        return this._blowgun.blow();
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Ninja>()).to(Ninja);
    container.bind(resolve<KatanaInterface>()).to(Katana);
    container.bind(resolve<ShurikenInterface>()).to(Shuriken);
    container.bind(resolve<BlowgunInterface>()).to(Blowgun);

    const ninja: Ninja = container.get(resolve<Ninja>());

    expect(ninja.fight()).toBe('cut!');
    expect(ninja.sneak()).toBe('hit!');
    expect(ninja.poisonDart()).toBe('poison!');
  });

  it('Should be able to use classes as runtime identifiers', () => {
    class Katana implements Injectable {
      public hit() {
        return 'cut!';
      }
    }

    class Shuriken implements Injectable {
      public throw() {
        return 'hit!';
      }
    }

    class Ninja implements Injectable {
      private readonly _katana: Katana;
      private readonly _shuriken: Shuriken;

      constructor(katana: Katana, shuriken: Shuriken) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.bind<Ninja>(Ninja).to(Ninja);
    container.bind<Katana>(Katana).to(Katana);
    container.bind<Shuriken>(Shuriken).to(Shuriken);

    const ninja: Ninja = container.get<Ninja>(Ninja);

    expect(ninja.fight()).toBe('cut!');
    expect(ninja.sneak()).toBe('hit!');
  });

  it('Should be able to use Symbols as runtime identifiers', () => {
    interface KatanaInterface {
      hit(): string;
    }

    interface ShurikenInterface {
      throw(): string;
    }

    class Katana implements KatanaInterface, Injectable {
      public hit() {
        return 'cut!';
      }
    }

    class Shuriken implements ShurikenInterface, Injectable {
      public throw() {
        return 'hit!';
      }
    }

    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Katana: Symbol.for('Katana'),
      Ninja: Symbol.for('Ninja'),
      Shuriken: Symbol.for('Shuriken'),
    };

    class Ninja implements Injectable {
      private readonly _katana: KatanaInterface;
      private readonly _shuriken: ShurikenInterface;

      constructor(
        katana: KatanaInterface,
        shuriken: ShurikenInterface,
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Ninja>()).to(Ninja);
    container.bind(resolve<KatanaInterface>()).to(Katana);
    container.bind(resolve<ShurikenInterface>()).to(Shuriken);

    const ninja: Ninja = container.get(resolve<Ninja>());

    expect(ninja.fight()).toBe('cut!');
    expect(ninja.sneak()).toBe('hit!');
  });

  it('Should be able to wrap Symbols with LazyServiceIdentifier', () => {
    interface KatanaInterface {
      hit(): string;
    }

    interface ShurikenInterface {
      throw(): string;
    }

    class Katana implements KatanaInterface, Injectable {
      public hit() {
        return 'cut!';
      }
    }

    class Shuriken implements ShurikenInterface, Injectable {
      public throw() {
        return 'hit!';
      }
    }

    class Ninja implements Injectable {
      private readonly _katana: KatanaInterface;
      private readonly _shuriken: ShurikenInterface;

      constructor(
        katana: KatanaInterface,
        shuriken: ShurikenInterface,
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Ninja>()).to(Ninja);
    container.bind(resolve<KatanaInterface>()).to(Katana);
    container.bind(resolve<ShurikenInterface>()).to(Shuriken);

    const ninja: Ninja = container.get(resolve<Ninja>());

    expect(ninja.fight()).toBe('cut!');
    expect(ninja.sneak()).toBe('hit!');
  });

  it('Should support Container modules', async () => {
    interface KatanaInterface {
      hit(): string;
    }

    interface ShurikenInterface {
      throw(): string;
    }

    interface NinjaInterface {
      fight(): string;
      sneak(): string;
    }

    class Katana implements KatanaInterface, Injectable {
      public hit() {
        return 'cut!';
      }
    }

    class Shuriken implements ShurikenInterface, Injectable {
      public throw() {
        return 'hit!';
      }
    }

    class Ninja implements NinjaInterface, Injectable {
      private readonly _katana: KatanaInterface;
      private readonly _shuriken: ShurikenInterface;

      constructor(
        katana: KatanaInterface,
        shuriken: ShurikenInterface,
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const warriors: ContainerModule = new ContainerModule(
      (options: ContainerModuleLoadOptions) => {
        options.bind(resolve<NinjaInterface>()).to(Ninja);
      },
    );

    const weapons: ContainerModule = new ContainerModule(
      (options: ContainerModuleLoadOptions) => {
        options.bind(resolve<KatanaInterface>()).to(Katana);
        options.bind(resolve<ShurikenInterface>()).to(Shuriken);
      },
    );

    const container: Container = new Container();

    // load
    await container.loadAsync(warriors, weapons);

    const ninjaId = resolve<NinjaInterface>();
    const katanaId = resolve<KatanaInterface>();
    const shurikenId = resolve<ShurikenInterface>();

    const ninja: NinjaInterface = container.get(ninjaId);

    expect(ninja.fight()).toBe('cut!');
    expect(ninja.sneak()).toBe('hit!');

    const tryGetNinja: () => void = () => {
      container.get(ninjaId);
    };
    const tryGetKatana: () => void = () => {
      container.get(katanaId);
    };
    const tryGetShuruken: () => void = () => {
      container.get(shurikenId);
    };

    // unload
    await container.unloadAsync(warriors);

    expect(tryGetNinja).toThrow();
    expect(tryGetKatana).not.toThrow();
    expect(tryGetShuruken).not.toThrow();

    await container.unloadAsync(weapons);

    expect(tryGetNinja).toThrow();
    expect(tryGetKatana).toThrow();
    expect(tryGetShuruken).toThrow();
  });

  it('Should support control over the scope of the dependencies', () => {
    interface KatanaInterface {
      hit(): string;
    }

    interface ShurikenInterface {
      throw(): string;
    }

    interface NinjaInterface {
      fight(): string;
      sneak(): string;
    }

    class Katana implements KatanaInterface, Injectable {
      private _usageCount: number;
      constructor() {
        this._usageCount = 0;
      }
      public hit() {
        this._usageCount = this._usageCount + 1;
        return `This katana was used ${this._usageCount.toString()} times!`;
      }
    }

    class Shuriken implements ShurikenInterface, Injectable {
      private _shurikenCount: number;
      constructor() {
        this._shurikenCount = 10;
      }
      public throw() {
        this._shurikenCount = this._shurikenCount - 1;
        return `Only ${this._shurikenCount.toString()} items left!`;
      }
    }

    class Ninja implements NinjaInterface, Injectable {
      private readonly _katana: KatanaInterface;
      private readonly _shuriken: ShurikenInterface;

      constructor(
        katana: KatanaInterface,
        shuriken: ShurikenInterface,
      ) {
        this._katana = katana;
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.bind(resolve<NinjaInterface>()).to(Ninja);
    container.bind(resolve<KatanaInterface>()).to(Katana).inSingletonScope();
    container.bind(resolve<ShurikenInterface>()).to(Shuriken);

    const ninja1: NinjaInterface = container.get(resolve<NinjaInterface>());

    expect(ninja1.fight()).toBe('This katana was used 1 times!');
    expect(ninja1.fight()).toBe('This katana was used 2 times!');
    expect(ninja1.sneak()).toBe('Only 9 items left!');
    expect(ninja1.sneak()).toBe('Only 8 items left!');

    const ninja2: NinjaInterface = container.get(resolve<NinjaInterface>());

    expect(ninja2.fight()).toBe('This katana was used 3 times!');
    expect(ninja2.sneak()).toBe('Only 9 items left!');
  });

  it('Should support the injection of classes to itself', () => {
    const heroName: string = 'superman';

    class Hero implements Injectable {
      public name: string;
      constructor() {
        this.name = heroName;
      }
    }

    const container: Container = new Container();
    container.bind(Hero).toSelf();
    const hero: Hero = container.get(Hero);

    expect(hero.name).toBe(heroName);
  });

  it('Should support the injection of constant values', () => {
    interface Warrior {
      name: string;
    }

    const heroName: string = 'superman';

    class Hero implements Warrior, Injectable {
      public name: string;
      constructor() {
        this.name = heroName;
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Warrior>()).toConstantValue(new Hero());
    const hero: Warrior = container.get(resolve<Warrior>());

    expect(hero.name).toBe(heroName);
  });

  it('Should support the injection of dynamic values', async () => {
    interface CurrentSymbol {}

    class UseSymbol implements Injectable {
      public currentSymbol: symbol;
      constructor(currentDate: CurrentSymbol) {
        this.currentSymbol = currentDate as unknown as symbol;
      }
      public doSomething() {
        return this.currentSymbol;
      }
    }

    const symbolId = resolve<CurrentSymbol>();

    const container: Container = new Container();
    container.bind(resolve<UseSymbol>()).to(UseSymbol);
    container
      .bind(symbolId)
      .toDynamicValue(
        (_context: ResolutionContext) => Symbol() as unknown as CurrentSymbol,
      );

    const subject1: UseSymbol = container.get(resolve<UseSymbol>());
    const subject2: UseSymbol = container.get(resolve<UseSymbol>());

    expect(subject1.doSomething()).not.toBe(subject2.doSomething());

    await container.unbindAsync(symbolId);
    container
      .bind(symbolId)
      .toConstantValue(Symbol() as unknown as CurrentSymbol);

    const subject3: UseSymbol = container.get(resolve<UseSymbol>());
    const subject4: UseSymbol = container.get(resolve<UseSymbol>());

    expect(subject3.doSomething()).toBe(subject4.doSomething());
  });

  it('Should support the injection of Functions', () => {
    type ShortDistanceWeaponFactory = () => ShortDistanceWeapon;

    class KatanaBlade implements Injectable {}

    class KatanaHandler implements Injectable {}

    interface ShortDistanceWeapon {
      handler: KatanaHandler;
      blade: KatanaBlade;
    }

    class Katana implements ShortDistanceWeapon, Injectable {
      public handler: KatanaHandler;
      public blade: KatanaBlade;
      constructor(handler: KatanaHandler, blade: KatanaBlade) {
        this.handler = handler;
        this.blade = blade;
      }
    }

    class Shuriken implements Injectable {}

    interface ShortDistanceWeaponFactoryId {}
    interface LongDistanceWeaponId {}

    interface Warrior {
      shortDistanceWeaponFactory: ShortDistanceWeaponFactory;
      longDistanceWeapon: Shuriken;
    }

    class Ninja implements Warrior, Injectable {
      public shortDistanceWeaponFactory: ShortDistanceWeaponFactory;
      public longDistanceWeapon: Shuriken;
      constructor(
        shortDistanceWeaponFactory: ShortDistanceWeaponFactoryId,
        longDistanceWeapon: LongDistanceWeaponId,
      ) {
        this.shortDistanceWeaponFactory =
          shortDistanceWeaponFactory as unknown as ShortDistanceWeaponFactory;
        this.longDistanceWeapon = longDistanceWeapon as unknown as Shuriken;
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Ninja>()).to(Ninja);
    container.bind(resolve<LongDistanceWeaponId>()).to(Shuriken);

    const katanaFactory: () => Katana = function () {
      return new Katana(new KatanaHandler(), new KatanaBlade());
    };

    container
      .bind(resolve<ShortDistanceWeaponFactoryId>())
      .toConstantValue(katanaFactory as unknown as ShortDistanceWeaponFactoryId);
    const ninja: Ninja = container.get(resolve<Ninja>());

    expect(ninja instanceof Ninja).toBe(true);
    expect(ninja.shortDistanceWeaponFactory).toStrictEqual(
      expect.any(Function),
    );
    expect(ninja.shortDistanceWeaponFactory() instanceof Katana).toBe(true);
    expect(
      ninja.shortDistanceWeaponFactory().handler instanceof KatanaHandler,
    ).toBe(true);
    expect(
      ninja.shortDistanceWeaponFactory().blade instanceof KatanaBlade,
    ).toBe(true);
    expect(ninja.longDistanceWeapon instanceof Shuriken).toBe(true);
  });

  it('Should support the injection of class constructors', () => {
    class Katana implements Injectable {
      public hit() {
        return 'cut!';
      }
    }

    interface NewableKatana {}

    class Ninja implements Injectable {
      private readonly _katana: Katana;

      constructor(katana: NewableKatana) {
        this._katana = new (katana as unknown as Newable<Katana>)();
      }

      public fight() {
        return this._katana.hit();
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Ninja>()).to(Ninja);
    container
      .bind(resolve<NewableKatana>())
      .toConstantValue(Katana as unknown as NewableKatana);

    const ninja: Ninja = container.get(resolve<Ninja>());

    expect(ninja.fight()).toBe('cut!');
  });

  it('Should support the injection of user defined factories', () => {
    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    interface KatanaInterface {
      hit(): string;
    }

    interface ShurikenInterface {
      throw(): string;
    }

    interface KatanaFactory {
      (): KatanaInterface;
    }

    class Katana implements KatanaInterface, Injectable {
      public hit() {
        return 'cut!';
      }
    }

    class Shuriken implements ShurikenInterface, Injectable {
      public throw() {
        return 'hit!';
      }
    }

    class NinjaWithUserDefinedFactory implements Ninja, Injectable {
      private readonly _katana: KatanaInterface;
      private readonly _shuriken: ShurikenInterface;

      constructor(
        katanaFactory: KatanaFactory,
        shuriken: ShurikenInterface,
      ) {
        this._katana = (katanaFactory as unknown as () => KatanaInterface)();
        this._shuriken = shuriken;
      }

      public fight() {
        return this._katana.hit();
      }
      public sneak() {
        return this._shuriken.throw();
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Ninja>()).to(NinjaWithUserDefinedFactory);
    container.bind(resolve<ShurikenInterface>()).to(Shuriken);
    container.bind(resolve<KatanaInterface>()).to(Katana);
    container
      .bind(resolve<KatanaFactory>())
      .toFactory(
        (context: ResolutionContext) => () =>
          context.get(resolve<KatanaInterface>()),
      );

    const ninja: Ninja = container.get(resolve<Ninja>());

    expect(ninja.fight()).toBe('cut!');
    expect(ninja.sneak()).toBe('hit!');
  });

  it('Should support the injection of user defined factories with args', () => {
    interface Ninja {
      fight(): string;
      sneak(): string;
    }

    interface Weapon {
      use(): string;
    }

    interface WeaponFactory {
      (throwable: boolean): Weapon;
    }

    class Katana implements Weapon, Injectable {
      public use() {
        return 'katana!';
      }
    }

    class Shuriken implements Weapon, Injectable {
      public use() {
        return 'shuriken!';
      }
    }

    class NinjaWithUserDefinedFactory implements Ninja, Injectable {
      private readonly _katana: Weapon;
      private readonly _shuriken: Weapon;

      constructor(
        weaponFactory: WeaponFactory,
      ) {
        const factory = weaponFactory as unknown as (throwable: boolean) => Weapon;
        this._katana = factory(false);
        this._shuriken = factory(true);
      }

      public fight() {
        return this._katana.use();
      }
      public sneak() {
        return this._shuriken.use();
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Ninja>()).to(NinjaWithUserDefinedFactory);
    container.bind(resolve<Weapon>()).to(Shuriken).whenTagged('throwable', true);
    container.bind(resolve<Weapon>()).to(Katana).whenTagged('throwable', false);

    container.bind(resolve<WeaponFactory>()).toFactory(
      (context: ResolutionContext) => (throwable: boolean) =>
        context.get(resolve<Weapon>(), {
          tag: {
            key: 'throwable',
            value: throwable,
          },
        }),
    );

    const ninja: Ninja = container.get(resolve<Ninja>());

    expect(ninja.fight()).toBe('katana!');
    expect(ninja.sneak()).toBe('shuriken!');
  });

  it('Should support the injection of user defined factories with partial application', () => {
    class InjectorPump implements Injectable {}

    class SparkPlugs implements Injectable {}

    class Engine {
      public displacement!: number | null;
    }

    interface InjectorPumpId {}
    interface SparkPlugsId {}
    interface EngineId {
      displacement: number | null;
    }
    interface EngineFactory {
      (theNamed: string): (displacement: number) => Engine;
    }

    class DieselEngine extends Engine implements Injectable {
      public override displacement: number | null;
      private readonly _injectorPump: InjectorPump;
      constructor(injectorPump: InjectorPumpId) {
        super();
        this._injectorPump = injectorPump as unknown as InjectorPump;
        this.displacement = null;
      }
      public debug() {
        return this._injectorPump;
      }
    }

    class PetrolEngine extends Engine implements Injectable {
      public override displacement: number | null;
      private readonly _sparkPlugs: SparkPlugs;
      constructor(sparkPlugs: SparkPlugsId) {
        super();
        this._sparkPlugs = sparkPlugs as unknown as SparkPlugs;
        this.displacement = null;
      }
      public debug() {
        return this._sparkPlugs;
      }
    }

    interface CarFactory {
      createEngine(displacement: number): Engine;
    }

    class DieselCarFactory implements CarFactory, Injectable {
      private readonly _dieselFactory: (displacement: number) => Engine;
      constructor(
        factory: EngineFactory,
      ) {
        this._dieselFactory = (factory as unknown as (category: string) => (displacement: number) => Engine)('diesel');
      }
      public createEngine(displacement: number): Engine {
        return this._dieselFactory(displacement);
      }
    }

    const container: Container = new Container();
    container.bind(resolve<SparkPlugsId>()).to(SparkPlugs);
    container.bind(resolve<InjectorPumpId>()).to(InjectorPump);
    container.bind(resolve<EngineId>()).to(PetrolEngine).whenNamed('petrol');
    container.bind(resolve<EngineId>()).to(DieselEngine).whenNamed('diesel');

    container
      .bind(resolve<EngineFactory>())
      .toFactory(
        (context: ResolutionContext) =>
          (theNamed: string) =>
          (displacement: number) => {
            const theEngine: Engine = context.get(resolve<EngineId>(), {
              name: theNamed,
            });
            theEngine.displacement = displacement;
            return theEngine;
          },
      );

    container.bind(resolve<CarFactory>()).to(DieselCarFactory);

    const dieselCarFactory: CarFactory = container.get(resolve<CarFactory>());
    const engine: Engine = dieselCarFactory.createEngine(300);

    expect(engine.displacement).toBe(300);
    expect(engine instanceof DieselEngine).toBe(true);
  });

  describe('Injection of multiple values with string as keys', () => {
    it('Should support the injection of multiple values', () => {
      interface Weapon {
        name: string;
      }

      class Katana implements Weapon, Injectable {
        public name: string = 'Katana';
      }

      class Shuriken implements Weapon, Injectable {
        public name: string = 'Shuriken';
      }

      interface Warrior {
        katana: Weapon;
        shuriken: Weapon;
      }

      class Ninja implements Warrior, Injectable {
        public katana: Weapon;
        public shuriken: Weapon;
        constructor(weapons: InjectMulti<Weapon>) {
          this.katana = weapons[0] as Weapon;
          this.shuriken = weapons[1] as Weapon;
        }
      }

      const container: Container = new Container();
      container.bind(resolve<Warrior>()).to(Ninja);
      container.bind(resolve<Weapon>()).to(Katana);
      container.bind(resolve<Weapon>()).to(Shuriken);

      const ninja: Warrior = container.get(resolve<Warrior>());

      expect(ninja.katana.name).toBe('Katana');
      expect(ninja.shuriken.name).toBe('Shuriken');

      // if only one value is bound to Weapon
      const container2: Container = new Container();
      container2.bind(resolve<Warrior>()).to(Ninja);
      container2.bind(resolve<Weapon>()).to(Katana);

      const ninja2: Ninja = container2.get(resolve<Warrior>());

      expect(ninja2.katana.name).toBe('Katana');
    });

    it('Should support the injection of multiple values with nested inject', () => {
      interface KatanaInterface {
        hit(): string;
      }

      interface ShurikenInterface {
        throw(): string;
      }

      class Katana implements KatanaInterface, Injectable {
        public hit() {
          return 'cut!';
        }
      }

      class Shuriken implements ShurikenInterface, Injectable {
        public throw() {
          return 'hit!';
        }
      }

      interface NinjaInterface {
        fight(): string;
        sneak(): string;
      }

      class Ninja implements NinjaInterface, Injectable {
        private readonly _katana: KatanaInterface;
        private readonly _shuriken: ShurikenInterface;

        constructor(
          katana: KatanaInterface,
          shuriken: ShurikenInterface,
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() {
          return this._katana.hit();
        }
        public sneak() {
          return this._shuriken.throw();
        }
      }

      interface School {
        ninjaMaster: NinjaInterface;
        student: NinjaInterface;
      }

      class NinjaSchool implements School, Injectable {
        public ninjaMaster: NinjaInterface;
        public student: NinjaInterface;

        constructor(ninja: InjectMulti<NinjaInterface>) {
          this.ninjaMaster = ninja[0] as NinjaInterface;
          this.student = ninja[1] as NinjaInterface;
        }
      }

      const container: Container = new Container();
      container.bind(resolve<KatanaInterface>()).to(Katana);
      container.bind(resolve<ShurikenInterface>()).to(Shuriken);
      container.bind(resolve<NinjaInterface>()).to(Ninja);
      container.bind(resolve<NinjaInterface>()).to(Ninja);
      container.bind(resolve<School>()).to(NinjaSchool);

      const ninjaSchool: School = container.get(resolve<School>());

      expect(ninjaSchool.ninjaMaster.fight()).toBe('cut!');
      expect(ninjaSchool.ninjaMaster.sneak()).toBe('hit!');

      expect(ninjaSchool.student.fight()).toBe('cut!');
      expect(ninjaSchool.student.sneak()).toBe('hit!');
    });

    it('Should support the injection of multiple values with nested multiInject', () => {
      interface Warrior {
        fight(): string;
        sneak(): string;
      }

      interface Sword {
        hit(): string;
      }

      interface ShurikenInterface {
        throw(): string;
      }

      class Katana implements Sword, Injectable {
        public hit() {
          return 'cut!';
        }
      }

      class Shuriken implements ShurikenInterface, Injectable {
        public throw() {
          return 'hit!';
        }
      }

      class Ninja implements Warrior, Injectable {
        private readonly _katana: Sword;
        private readonly _shuriken: ShurikenInterface;

        constructor(
          katana: Sword,
          shuriken: ShurikenInterface,
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() {
          return this._katana.hit();
        }
        public sneak() {
          return this._shuriken.throw();
        }
      }

      interface School {
        ninjaMaster: Warrior;
        student: Warrior;
      }

      class NinjaSchool implements School, Injectable {
        public ninjaMaster: Warrior;
        public student: Warrior;

        constructor(ninjas: InjectMulti<Warrior>) {
          this.ninjaMaster = ninjas[0] as Warrior;
          this.student = ninjas[1] as Warrior;
        }
      }

      interface Organisation {
        schools: School[];
      }

      class NinjaOrganisation implements Organisation, Injectable {
        public schools: School[];

        constructor(schools: InjectMulti<School>) {
          this.schools = schools;
        }
      }

      const container: Container = new Container();
      container.bind(resolve<Sword>()).to(Katana);
      container.bind(resolve<ShurikenInterface>()).to(Shuriken);
      container.bind(resolve<Warrior>()).to(Ninja);
      container.bind(resolve<Warrior>()).to(Ninja);
      container.bind(resolve<School>()).to(NinjaSchool);
      container.bind(resolve<School>()).to(NinjaSchool);
      container.bind(resolve<Organisation>()).to(NinjaOrganisation);

      const ninjaOrganisation: Organisation =
        container.get(resolve<Organisation>());

      for (let i: number = 0; i < 2; i++) {
        const ithNinjaOrganizationSchool: School = ninjaOrganisation.schools[
          i
        ] as School;

        expect(ithNinjaOrganizationSchool.ninjaMaster.fight()).toBe('cut!');
        expect(ithNinjaOrganizationSchool.ninjaMaster.sneak()).toBe('hit!');
        expect(ithNinjaOrganizationSchool.student.fight()).toBe('cut!');
        expect(ithNinjaOrganizationSchool.student.sneak()).toBe('hit!');
      }
    });
  });

  describe('Injection of multiple values with class as keys', () => {
    it('Should support the injection of multiple values when using classes as keys', () => {
      class Weapon implements Injectable {
        public name!: string;
      }

      class Katana extends Weapon implements Injectable {
        constructor() {
          super();
          this.name = 'Katana';
        }
      }

      class Shuriken extends Weapon implements Injectable {
        constructor() {
          super();
          this.name = 'Shuriken';
        }
      }

      class Ninja implements Injectable {
        public katana: Weapon;
        public shuriken: Weapon;
        constructor(weapons: InjectMulti<Weapon>) {
          this.katana = weapons[0] as Weapon;
          this.shuriken = weapons[1] as Weapon;
        }
      }

      const container: Container = new Container();
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<Weapon>(Weapon).to(Katana);
      container.bind<Weapon>(Weapon).to(Shuriken);

      const ninja: Ninja = container.get<Ninja>(Ninja);

      expect(ninja.katana.name).toBe('Katana');
      expect(ninja.shuriken.name).toBe('Shuriken');

      // if only one value is bound to Weapon
      const container2: Container = new Container();
      container2.bind<Ninja>(Ninja).to(Ninja);
      container2.bind<Weapon>(Weapon).to(Katana);

      const ninja2: Ninja = container2.get<Ninja>(Ninja);

      expect(ninja2.katana.name).toBe('Katana');
    });

    it('Should support the injection of multiple values with nested inject', () => {
      class Katana implements Injectable {
        public hit() {
          return 'cut!';
        }
      }

      class Shuriken implements Injectable {
        public throw() {
          return 'hit!';
        }
      }

      class Ninja implements Injectable {
        private readonly _katana: Katana;
        private readonly _shuriken: Shuriken;

        constructor(katana: Katana, shuriken: Shuriken) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() {
          return this._katana.hit();
        }
        public sneak() {
          return this._shuriken.throw();
        }
      }

      class NinjaSchool implements Injectable {
        public ninjaMaster: Ninja;
        public student: Ninja;

        constructor(ninja: InjectMulti<Ninja>) {
          this.ninjaMaster = ninja[0] as Ninja;
          this.student = ninja[1] as Ninja;
        }
      }

      const container: Container = new Container();
      container.bind<Katana>(Katana).to(Katana);
      container.bind<Shuriken>(Shuriken).to(Shuriken);
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<NinjaSchool>(NinjaSchool).to(NinjaSchool);

      const ninjaSchool: NinjaSchool = container.get<NinjaSchool>(NinjaSchool);

      expect(ninjaSchool.ninjaMaster.fight()).toBe('cut!');
      expect(ninjaSchool.ninjaMaster.sneak()).toBe('hit!');

      expect(ninjaSchool.student.fight()).toBe('cut!');
      expect(ninjaSchool.student.sneak()).toBe('hit!');
    });

    it('Should support the injection of multiple values with nested multiInject', () => {
      class Katana implements Injectable {
        public hit() {
          return 'cut!';
        }
      }

      class Shuriken implements Injectable {
        public throw() {
          return 'hit!';
        }
      }

      class Ninja implements Injectable {
        private readonly _katana: Katana;
        private readonly _shuriken: Shuriken;

        constructor(katana: Katana, shuriken: Shuriken) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() {
          return this._katana.hit();
        }
        public sneak() {
          return this._shuriken.throw();
        }
      }

      class NinjaSchool implements Injectable {
        public ninjaMaster: Ninja;
        public student: Ninja;

        constructor(ninjas: InjectMulti<Ninja>) {
          this.ninjaMaster = ninjas[0] as Ninja;
          this.student = ninjas[1] as Ninja;
        }
      }

      class NinjaOrganisation implements Injectable {
        public schools: NinjaSchool[];

        constructor(schools: InjectMulti<NinjaSchool>) {
          this.schools = schools;
        }
      }

      const container: Container = new Container();
      container.bind<Katana>(Katana).to(Katana);
      container.bind<Shuriken>(Shuriken).to(Shuriken);
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<Ninja>(Ninja).to(Ninja);
      container.bind<NinjaSchool>(NinjaSchool).to(NinjaSchool);
      container.bind<NinjaSchool>(NinjaSchool).to(NinjaSchool);
      container
        .bind<NinjaOrganisation>(NinjaOrganisation)
        .to(NinjaOrganisation);

      const ninjaOrganisation: NinjaOrganisation =
        container.get<NinjaOrganisation>(NinjaOrganisation);

      for (let i: number = 0; i < 2; i++) {
        const ithNinjaOrganizationSchool: NinjaSchool = ninjaOrganisation
          .schools[i] as NinjaSchool;

        expect(ithNinjaOrganizationSchool.ninjaMaster.fight()).toBe('cut!');
        expect(ithNinjaOrganizationSchool.ninjaMaster.sneak()).toBe('hit!');
        expect(ithNinjaOrganizationSchool.student.fight()).toBe('cut!');
        expect(ithNinjaOrganizationSchool.student.sneak()).toBe('hit!');
      }
    });
  });

  describe('Injection of multiple values with Symbol as keys', () => {
    it('Should support the injection of multiple values when using Symbols as keys', () => {
      interface Weapon {
        name: string;
      }

      class Katana implements Weapon, Injectable {
        public name: string = 'Katana';
      }

      class Shuriken implements Weapon, Injectable {
        public name: string = 'Shuriken';
      }

      interface Warrior {
        katana: Weapon;
        shuriken: Weapon;
      }

      class Ninja implements Warrior, Injectable {
        public katana: Weapon;
        public shuriken: Weapon;
        constructor(weapons: InjectMulti<Weapon>) {
          this.katana = weapons[0] as Weapon;
          this.shuriken = weapons[1] as Weapon;
        }
      }

      const container: Container = new Container();
      container.bind(resolve<Warrior>()).to(Ninja);
      container.bind(resolve<Weapon>()).to(Katana);
      container.bind(resolve<Weapon>()).to(Shuriken);

      const ninja: Ninja = container.get(resolve<Warrior>());

      expect(ninja.katana.name).toBe('Katana');
      expect(ninja.shuriken.name).toBe('Shuriken');

      // if only one value is bound to Weapon
      const container2: Container = new Container();
      container2.bind(resolve<Warrior>()).to(Ninja);
      container2.bind(resolve<Weapon>()).to(Katana);

      const ninja2: Ninja = container2.get(resolve<Warrior>());

      expect(ninja2.katana.name).toBe('Katana');
    });

    it('Should support the injection of multiple values with nested inject', () => {
      interface KatanaInterface {
        hit(): string;
      }

      interface ShurikenInterface {
        throw(): string;
      }

      class Katana implements KatanaInterface, Injectable {
        public hit() {
          return 'cut!';
        }
      }

      class Shuriken implements ShurikenInterface, Injectable {
        public throw() {
          return 'hit!';
        }
      }

      class Ninja implements Injectable {
        private readonly _katana: KatanaInterface;
        private readonly _shuriken: ShurikenInterface;

        constructor(
          katana: KatanaInterface,
          shuriken: ShurikenInterface,
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() {
          return this._katana.hit();
        }
        public sneak() {
          return this._shuriken.throw();
        }
      }

      interface School {
        ninjaMaster: Ninja;
        student: Ninja;
      }

      class NinjaSchool implements School, Injectable {
        public ninjaMaster: Ninja;
        public student: Ninja;

        constructor(ninja: InjectMulti<Ninja>) {
          this.ninjaMaster = ninja[0] as Ninja;
          this.student = ninja[1] as Ninja;
        }
      }

      const container: Container = new Container();
      container.bind(resolve<KatanaInterface>()).to(Katana);
      container.bind(resolve<ShurikenInterface>()).to(Shuriken);
      container.bind(resolve<Ninja>()).to(Ninja);
      container.bind(resolve<Ninja>()).to(Ninja);
      container.bind(resolve<School>()).to(NinjaSchool);

      const ninjaSchool: School = container.get(resolve<School>());

      expect(ninjaSchool.ninjaMaster.fight()).toBe('cut!');
      expect(ninjaSchool.ninjaMaster.sneak()).toBe('hit!');

      expect(ninjaSchool.student.fight()).toBe('cut!');
      expect(ninjaSchool.student.sneak()).toBe('hit!');
    });

    it('Should support the injection of multiple values with nested multiInject', () => {
      interface KatanaInterface {
        hit(): string;
      }

      interface ShurikenInterface {
        throw(): string;
      }

      class Katana implements KatanaInterface, Injectable {
        public hit() {
          return 'cut!';
        }
      }

      class Shuriken implements ShurikenInterface, Injectable {
        public throw() {
          return 'hit!';
        }
      }

      class Ninja implements Injectable {
        private readonly _katana: KatanaInterface;
        private readonly _shuriken: ShurikenInterface;

        constructor(
          katana: KatanaInterface,
          shuriken: ShurikenInterface,
        ) {
          this._katana = katana;
          this._shuriken = shuriken;
        }

        public fight() {
          return this._katana.hit();
        }
        public sneak() {
          return this._shuriken.throw();
        }
      }

      interface School {
        ninjaMaster: Ninja;
        student: Ninja;
      }

      class NinjaSchool implements School, Injectable {
        public ninjaMaster: Ninja;
        public student: Ninja;

        constructor(ninjas: InjectMulti<Ninja>) {
          this.ninjaMaster = ninjas[0] as Ninja;
          this.student = ninjas[1] as Ninja;
        }
      }

      interface Organisation {
        schools: NinjaSchool[];
      }

      class NinjaOrganisation implements Organisation, Injectable {
        public schools: NinjaSchool[];

        constructor(schools: InjectMulti<School>) {
          this.schools = schools as NinjaSchool[];
        }
      }

      const container: Container = new Container();
      container.bind(resolve<KatanaInterface>()).to(Katana);
      container.bind(resolve<ShurikenInterface>()).to(Shuriken);
      container.bind(resolve<Ninja>()).to(Ninja);
      container.bind(resolve<Ninja>()).to(Ninja);
      container.bind(resolve<School>()).to(NinjaSchool);
      container.bind(resolve<School>()).to(NinjaSchool);
      container.bind(resolve<Organisation>()).to(NinjaOrganisation);

      const ninjaOrganisation: Organisation = container.get(
        resolve<Organisation>(),
      );

      for (let i: number = 0; i < 2; i++) {
        const ithNinjaOrganizationSchool: School = ninjaOrganisation.schools[
          i
        ] as School;

        expect(ithNinjaOrganizationSchool.ninjaMaster.fight()).toBe('cut!');
        expect(ithNinjaOrganizationSchool.ninjaMaster.sneak()).toBe('hit!');
        expect(ithNinjaOrganizationSchool.student.fight()).toBe('cut!');
        expect(ithNinjaOrganizationSchool.student.sneak()).toBe('hit!');
      }
    });
  });

  it('Should support tagged bindings', () => {
    interface Weapon {}

    class Katana implements Weapon, Injectable {}

    class Shuriken implements Weapon, Injectable {}

    interface Warrior {
      katana: unknown;
      shuriken: unknown;
    }

    class Ninja implements Warrior, Injectable {
      public katana: unknown;
      public shuriken: unknown;
      constructor(
        katana: InjectTagged<Weapon, 'canThrow', false>,
        shuriken: InjectTagged<Weapon, 'canThrow', true>,
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Warrior>()).to(Ninja);
    container.bind(resolve<Weapon>()).to(Katana).whenTagged('canThrow', false);
    container.bind(resolve<Weapon>()).to(Shuriken).whenTagged('canThrow', true);

    const ninja: Ninja = container.get(resolve<Warrior>());

    expect(ninja.katana instanceof Katana).toBe(true);
    expect(ninja.shuriken instanceof Shuriken).toBe(true);
  });

  it('Should support custom tag decorators', () => {
    interface Weapon {}

    class Katana implements Weapon, Injectable {}

    class Shuriken implements Weapon, Injectable {}

    interface Warrior {
      katana: unknown;
      shuriken: unknown;
    }

    class Ninja implements Warrior, Injectable {
      public katana: unknown;
      public shuriken: unknown;
      constructor(
        katana: InjectTagged<Weapon, 'canThrow', false>,
        shuriken: InjectTagged<Weapon, 'canThrow', true>,
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Warrior>()).to(Ninja);
    container.bind(resolve<Weapon>()).to(Katana).whenTagged('canThrow', false);
    container.bind(resolve<Weapon>()).to(Shuriken).whenTagged('canThrow', true);

    const ninja: Warrior = container.get(resolve<Warrior>());

    expect(ninja.katana instanceof Katana).toBe(true);
    expect(ninja.shuriken instanceof Shuriken).toBe(true);
  });

  it('Should support named bindings', () => {
    interface Weapon {}

    class Katana implements Weapon, Injectable {}

    class Shuriken implements Weapon, Injectable {}

    interface Warrior {
      katana: unknown;
      shuriken: unknown;
    }

    class Ninja implements Warrior, Injectable {
      public katana: unknown;
      public shuriken: unknown;
      constructor(
        katana: InjectNamed<Weapon, 'strong'>,
        shuriken: InjectNamed<Weapon, 'weak'>,
      ) {
        this.katana = katana;
        this.shuriken = shuriken;
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Warrior>()).to(Ninja);
    container.bind(resolve<Weapon>()).to(Katana).whenNamed('strong');
    container.bind(resolve<Weapon>()).to(Shuriken).whenNamed('weak');

    const ninja: Warrior = container.get(resolve<Warrior>());

    expect(ninja.katana instanceof Katana).toBe(true);
    expect(ninja.shuriken instanceof Shuriken).toBe(true);
  });

  it('Should be able to resolve a ambiguous binding by providing a named tag', () => {
    interface Weapon {
      name: string;
    }

    class Katana implements Weapon, Injectable {
      public name: string;
      constructor() {
        this.name = 'katana';
      }
    }

    class Shuriken implements Weapon, Injectable {
      public name: string;
      constructor() {
        this.name = 'shuriken';
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Weapon>()).to(Katana).whenNamed('japanese');
    container.bind(resolve<Weapon>()).to(Shuriken).whenNamed('chinese');

    const katana: Weapon = container.get(resolve<Weapon>(), {
      name: 'japanese',
    });
    const shuriken: Weapon = container.get(resolve<Weapon>(), {
      name: 'chinese',
    });

    expect(katana.name).toBe('katana');
    expect(shuriken.name).toBe('shuriken');
  });

  it('Should be able to resolve a ambiguous binding by providing a custom tag', () => {
    interface Weapon {
      name: string;
    }

    class Katana implements Weapon, Injectable {
      public name: string;
      constructor() {
        this.name = 'katana';
      }
    }

    class Shuriken implements Weapon, Injectable {
      public name: string;
      constructor() {
        this.name = 'shuriken';
      }
    }

    const container: Container = new Container();
    container
      .bind(resolve<Weapon>())
      .to(Katana)
      .whenTagged('faction', 'samurai');
    container
      .bind(resolve<Weapon>())
      .to(Shuriken)
      .whenTagged('faction', 'ninja');

    const katana: Weapon = container.get(resolve<Weapon>(), {
      tag: {
        key: 'faction',
        value: 'samurai',
      },
    });
    const shuriken: Weapon = container.get(resolve<Weapon>(), {
      tag: {
        key: 'faction',
        value: 'ninja',
      },
    });

    expect(katana.name).toBe('katana');
    expect(shuriken.name).toBe('shuriken');
  });

  it('Should be able to inject into a super constructor', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const SYMBOLS = {
      Samurai: Symbol.for('Samurai'),
      SamuraiMaster: Symbol.for('SamuraiMaster'),
      SamuraiMaster2: Symbol.for('SamuraiMaster2'),
      Weapon: Symbol.for('Weapon'),
    };

    interface Weapon {
      name: string;
    }

    interface Warrior {
      weapon: Weapon;
    }

    class Katana implements Weapon, Injectable {
      public name: string;
      constructor() {
        this.name = 'katana';
      }
    }

    class Samurai implements Warrior, Injectable {
      public weapon: Weapon;

      constructor(weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    class SamuraiMaster extends Samurai implements Warrior, Injectable {
      public isMaster: boolean;
      constructor(weapon: Weapon) {
        super(weapon);
        this.isMaster = true;
      }
    }

    const container: Container = new Container();
    container.bind(resolve<Weapon>()).to(Katana);

    container.bind<Warrior>(SYMBOLS.SamuraiMaster2).to(SamuraiMaster);

    const samuraiMaster2: SamuraiMaster = container.get<SamuraiMaster>(
      SYMBOLS.SamuraiMaster2,
    );

    expect(samuraiMaster2.weapon.name).toBe('katana');

    // eslint-disable-next-line vitest/valid-expect, @typescript-eslint/no-unused-expressions
    expectTypeOf(typeof samuraiMaster2.isMaster).toBeBoolean;
  });

  it('Should support a whenParentNamed contextual bindings constraint', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon',
    };

    interface Material {
      name: string;
    }

    class Wood implements Material, Injectable {
      public name: string;
      constructor() {
        this.name = 'wood';
      }
    }

    class Iron implements Material, Injectable {
      public name: string;
      constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    class Sword implements Weapon, Injectable {
      public material: Material;
      constructor(material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    class NinjaStudent implements Ninja, Injectable {
      public weapon: Weapon;

      constructor(weapon: InjectNamed<Weapon, 'non-lethal'>) {
        this.weapon = weapon;
      }
    }

    class NinjaMaster implements Ninja, Injectable {
      public weapon: Weapon;

      constructor(weapon: InjectNamed<Weapon, 'lethal'>) {
        this.weapon = weapon;
      }
    }

    const container: Container = new Container();
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('master', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('master', true);
    container.bind(resolve<Weapon>()).to(Sword);
    container.bind(resolve<Material>()).to(Iron).whenParentNamed('lethal');
    container
      .bind(resolve<Material>())
      .to(Wood)
      .whenParentNamed('non-lethal');

    const master: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: true,
      },
    });
    const student: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: false,
      },
    });

    expect(master.weapon.material.name).toBe('iron');
    expect(student.weapon.material.name).toBe('wood');
  });

  it('Should support a whenParentTagged contextual bindings constraint', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon',
    };

    interface Material {
      name: string;
    }

    class Wood implements Material, Injectable {
      public name: string;
      constructor() {
        this.name = 'wood';
      }
    }

    class Iron implements Material, Injectable {
      public name: string;
      constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    class Sword implements Weapon, Injectable {
      public material: Material;
      constructor(material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    class NinjaStudent implements Ninja, Injectable {
      public weapon: Weapon;

      constructor(weapon: InjectTagged<Weapon, 'lethal', false>) {
        this.weapon = weapon;
      }
    }

    class NinjaMaster implements Ninja, Injectable {
      public weapon: Weapon;

      constructor(weapon: InjectTagged<Weapon, 'lethal', true>) {
        this.weapon = weapon;
      }
    }

    const container: Container = new Container();
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('master', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('master', true);
    container.bind(resolve<Weapon>()).to(Sword);
    container
      .bind(resolve<Material>())
      .to(Iron)
      .whenParentTagged('lethal', true);
    container
      .bind(resolve<Material>())
      .to(Wood)
      .whenParentTagged('lethal', false);

    const master: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: true,
      },
    });
    const student: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: false,
      },
    });

    expect(master.weapon.material.name).toBe('iron');
    expect(student.weapon.material.name).toBe('wood');
  });

  it('Should support a whenAnyAncestorIs and whenNoAncestorIs contextual bindings constraint', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon',
    };

    interface Material {
      name: string;
    }

    class Wood implements Material, Injectable {
      public name: string;
      constructor() {
        this.name = 'wood';
      }
    }

    class Iron implements Material, Injectable {
      public name: string;
      constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    class Sword implements Weapon, Injectable {
      public material: Material;
      constructor(material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    class NinjaStudent implements Ninja, Injectable {
      public weapon: Weapon;

      constructor(weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    class NinjaMaster implements Ninja, Injectable {
      public weapon: Weapon;

      constructor(weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    function isNinjaStudentConstraint(
      bindingConstraints: BindingConstraints,
    ): boolean {
      return (
        bindingConstraints.serviceIdentifier === TYPES.Ninja &&
        bindingConstraints.tags.get('master') === false
      );
    }

    function isNinjaMasterConstraint(
      bindingConstraints: BindingConstraints,
    ): boolean {
      return (
        bindingConstraints.serviceIdentifier === TYPES.Ninja &&
        bindingConstraints.tags.get('master') === true
      );
    }

    // whenAnyAncestorIs
    const container: Container = new Container();
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('master', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('master', true);
    container.bind(resolve<Weapon>()).to(Sword);
    container
      .bind(resolve<Material>())
      .to(Iron)
      .whenAnyAncestor(isNinjaMasterConstraint);
    container
      .bind(resolve<Material>())
      .to(Wood)
      .whenAnyAncestor(isNinjaStudentConstraint);

    const master: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: true,
      },
    });
    const student: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: false,
      },
    });

    expect(master.weapon.material.name).toBe('iron');
    expect(student.weapon.material.name).toBe('wood');

    // whenNoAncestorIs
    const container2: Container = new Container();
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('master', false);
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('master', true);
    container2.bind(resolve<Weapon>()).to(Sword);
    container2
      .bind(resolve<Material>())
      .to(Iron)
      .whenNoAncestor(isNinjaStudentConstraint);
    container2
      .bind(resolve<Material>())
      .to(Wood)
      .whenNoAncestor(isNinjaMasterConstraint);

    const master2: Ninja = container2.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: true,
      },
    });
    const student2: Ninja = container2.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: false,
      },
    });

    expect(master2.weapon.material.name).toBe('iron');
    expect(student2.weapon.material.name).toBe('wood');
  });

  it('Should support a whenAnyAncestorNamed and whenNoAncestorNamed contextual bindings constraint', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon',
    };

    interface Material {
      name: string;
    }

    class Wood implements Material, Injectable {
      public name: string;
      constructor() {
        this.name = 'wood';
      }
    }

    class Iron implements Material, Injectable {
      public name: string;
      constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    class Sword implements Weapon, Injectable {
      public material: Material;
      constructor(material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    class NinjaStudent implements Ninja, Injectable {
      public weapon: Weapon;

      constructor(weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    class NinjaMaster implements Ninja, Injectable {
      public weapon: Weapon;

      constructor(weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    // whenAnyAncestorNamed
    const container: Container = new Container();
    container.bind<Ninja>(TYPES.Ninja).to(NinjaStudent).whenNamed('non-lethal');
    container.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenNamed('lethal');
    container.bind(resolve<Weapon>()).to(Sword);
    container
      .bind(resolve<Material>())
      .to(Iron)
      .whenAnyAncestorNamed('lethal');
    container
      .bind(resolve<Material>())
      .to(Wood)
      .whenAnyAncestorNamed('non-lethal');

    const master: Ninja = container.get<Ninja>(TYPES.Ninja, {
      name: 'lethal',
    });
    const student: Ninja = container.get<Ninja>(TYPES.Ninja, {
      name: 'non-lethal',
    });

    expect(master.weapon.material.name).toBe('iron');
    expect(student.weapon.material.name).toBe('wood');

    // whenNoAncestorNamed
    const container2: Container = new Container();
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenNamed('non-lethal');
    container2.bind<Ninja>(TYPES.Ninja).to(NinjaMaster).whenNamed('lethal');
    container2.bind(resolve<Weapon>()).to(Sword);
    container2
      .bind(resolve<Material>())
      .to(Iron)
      .whenNoAncestorNamed('non-lethal');
    container2
      .bind(resolve<Material>())
      .to(Wood)
      .whenNoAncestorNamed('lethal');

    const master2: Ninja = container.get<Ninja>(TYPES.Ninja, {
      name: 'lethal',
    });
    const student2: Ninja = container.get<Ninja>(TYPES.Ninja, {
      name: 'non-lethal',
    });

    expect(master2.weapon.material.name).toBe('iron');
    expect(student2.weapon.material.name).toBe('wood');
  });

  it('Should support a whenAnyAncestorTagged and whenNoAncestorTaggedcontextual bindings constraint', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon',
    };

    interface Material {
      name: string;
    }

    class Wood implements Material, Injectable {
      public name: string;
      constructor() {
        this.name = 'wood';
      }
    }

    class Iron implements Material, Injectable {
      public name: string;
      constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    class Sword implements Weapon, Injectable {
      public material: Material;
      constructor(material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    class NinjaStudent implements Ninja, Injectable {
      public weapon: Weapon;

      constructor(weapon: InjectTagged<Weapon, 'lethal', false>) {
        this.weapon = weapon;
      }
    }

    class NinjaMaster implements Ninja, Injectable {
      public weapon: Weapon;

      constructor(weapon: InjectTagged<Weapon, 'lethal', true>) {
        this.weapon = weapon;
      }
    }

    // whenAnyAncestorTagged
    const container: Container = new Container();
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('lethal', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('lethal', true);
    container.bind(resolve<Weapon>()).to(Sword);
    container
      .bind(resolve<Material>())
      .to(Iron)
      .whenAnyAncestorTagged('lethal', true);
    container
      .bind(resolve<Material>())
      .to(Wood)
      .whenAnyAncestorTagged('lethal', false);

    const master: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'lethal',
        value: true,
      },
    });
    const student: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'lethal',
        value: false,
      },
    });

    expect(master.weapon.material.name).toBe('iron');
    expect(student.weapon.material.name).toBe('wood');

    // whenNoAncestorTagged
    const container2: Container = new Container();
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('lethal', false);
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('lethal', true);
    container2.bind(resolve<Weapon>()).to(Sword);
    container2
      .bind(resolve<Material>())
      .to(Iron)
      .whenNoAncestorTagged('lethal', false);
    container2
      .bind(resolve<Material>())
      .to(Wood)
      .whenNoAncestorTagged('lethal', true);

    const master2: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'lethal',
        value: true,
      },
    });
    const student2: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'lethal',
        value: false,
      },
    });

    expect(master2.weapon.material.name).toBe('iron');
    expect(student2.weapon.material.name).toBe('wood');
  });

  it('Should support a whenAnyAncestorMatches and whenNoAncestorMatches contextual bindings constraint', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const TYPES = {
      Material: 'Material',
      Ninja: 'Ninja',
      Weapon: 'Weapon',
    };

    interface Material {
      name: string;
    }

    class Wood implements Material, Injectable {
      public name: string;
      constructor() {
        this.name = 'wood';
      }
    }

    class Iron implements Material, Injectable {
      public name: string;
      constructor() {
        this.name = 'iron';
      }
    }

    interface Weapon {
      material: Material;
    }

    class Sword implements Weapon, Injectable {
      public material: Material;
      constructor(material: Material) {
        this.material = material;
      }
    }

    interface Ninja {
      weapon: Weapon;
    }

    class NinjaStudent implements Ninja, Injectable {
      public weapon: Weapon;

      constructor(weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    class NinjaMaster implements Ninja, Injectable {
      public weapon: Weapon;

      constructor(weapon: Weapon) {
        this.weapon = weapon;
      }
    }

    // custom constraints
    function isNinjaStudentConstraint(
      bindingConstraints: BindingConstraints,
    ): boolean {
      return (
        bindingConstraints.serviceIdentifier === TYPES.Ninja &&
        bindingConstraints.tags.get('master') === false
      );
    }

    function isNinjaMasterConstraint(
      bindingConstraints: BindingConstraints,
    ): boolean {
      return (
        bindingConstraints.serviceIdentifier === TYPES.Ninja &&
        bindingConstraints.tags.get('master') === true
      );
    }

    // whenAnyAncestorMatches
    const container: Container = new Container();
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('master', false);
    container
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('master', true);
    container.bind(resolve<Weapon>()).to(Sword);
    container
      .bind(resolve<Material>())
      .to(Iron)
      .whenAnyAncestor(isNinjaMasterConstraint);
    container
      .bind(resolve<Material>())
      .to(Wood)
      .whenAnyAncestor(isNinjaStudentConstraint);

    const master: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: true,
      },
    });
    const student: Ninja = container.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: false,
      },
    });

    expect(master.weapon.material.name).toBe('iron');
    expect(student.weapon.material.name).toBe('wood');

    // whenNoAncestorMatches
    const container2: Container = new Container();
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaStudent)
      .whenTagged('master', false);
    container2
      .bind<Ninja>(TYPES.Ninja)
      .to(NinjaMaster)
      .whenTagged('master', true);
    container2.bind(resolve<Weapon>()).to(Sword);
    container2
      .bind(resolve<Material>())
      .to(Iron)
      .whenNoAncestor(isNinjaStudentConstraint);
    container2
      .bind(resolve<Material>())
      .to(Wood)
      .whenNoAncestor(isNinjaMasterConstraint);

    const master2: Ninja = container2.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: true,
      },
    });
    const student2: Ninja = container2.get<Ninja>(TYPES.Ninja, {
      tag: {
        key: 'master',
        value: false,
      },
    });

    expect(master2.weapon.material.name).toBe('iron');
    expect(student2.weapon.material.name).toBe('wood');
  });

  it('Should be able to inject a regular derived class', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const SYMBOLS = {
      RANK: Symbol.for('RANK'),
      SamuraiMaster: Symbol.for('SamuraiMaster'),
    };

    interface Warrior {
      rank: string;
    }

    interface RankId {}

    class Samurai implements Warrior, Injectable {
      public rank: string;

      constructor(rank: RankId) {
        this.rank = rank as unknown as string;
      }
    }

    class SamuraiMaster extends Samurai implements Warrior, Injectable {
      constructor(rank: RankId) {
        super(rank);
      }
    }

    const container: Container = new Container();
    container.bind<Warrior>(SYMBOLS.SamuraiMaster).to(SamuraiMaster);
    container
      .bind(resolve<RankId>())
      .toConstantValue('Master' as unknown as RankId);

    const samurai: SamuraiMaster = container.get<SamuraiMaster>(
      SYMBOLS.SamuraiMaster,
    );

    expect(samurai.rank).toBe('Master');
  });

  it('Should not throw due to a missing @injectable in a base class', () => {
    // eslint-disable-next-line @typescript-eslint/typedef
    const SYMBOLS = {
      SamuraiMaster: Symbol.for('SamuraiMaster'),
    };

    interface Warrior {
      rank: string;
    }

    // IMPORTANT: Missing Injectable
    class Samurai implements Warrior {
      public rank: string;

      constructor(rank: string) {
        this.rank = rank;
      }
    }

    class SamuraiMaster extends Samurai implements Warrior, Injectable {
      constructor() {
        super('master');
      }
    }

    const container: Container = new Container();
    container.bind<Warrior>(SYMBOLS.SamuraiMaster).to(SamuraiMaster);

    function notThrows() {
      return container.get<Warrior>(SYMBOLS.SamuraiMaster);
    }

    expect(notThrows).not.toThrow();
  });
});
