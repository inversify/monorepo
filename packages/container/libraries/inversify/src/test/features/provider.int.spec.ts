import { describe, expect, it } from 'vitest';

import { Container, injectable, Provider, ResolutionContext } from '../..';

// eslint-disable-next-line vitest/prefer-describe-function-title
describe('Provider', () => {
  it('Should support complex asynchronous initialization processes', async () => {
    @injectable()
    class Ninja {
      public level: number;
      public rank: string;

      constructor() {
        this.level = 0;
        this.rank = 'Ninja';
      }

      public async train(): Promise<number> {
        return new Promise<number>(
          (resolve: (value: number | PromiseLike<number>) => void) => {
            setTimeout(() => {
              this.level += 10;
              resolve(this.level);
            }, 10);
          },
        );
      }
    }

    @injectable()
    class NinjaMaster {
      public rank: string;
      constructor() {
        this.rank = 'NinjaMaster';
      }
    }

    type NinjaMasterProvider = () => Promise<NinjaMaster>;

    const container: Container = new Container();

    container.bind<Ninja>('Ninja').to(Ninja).inSingletonScope();

    container
      .bind<NinjaMasterProvider>('Provider<NinjaMaster>')
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      .toProvider((context: ResolutionContext) => async () => {
        const ninja: Ninja = context.get<Ninja>('Ninja');

        const level: number = await ninja.train();

        if (level >= 20) {
          return new NinjaMaster();
        } else {
          throw new Error('Not enough training');
        }
      });

    const ninjaMasterProvider: NinjaMasterProvider =
      container.get<NinjaMasterProvider>('Provider<NinjaMaster>');

    // helper
    async function valueOrDefault<T>(
      provider: () => Promise<T>,
      defaultValue: T,
    ): Promise<T> {
      try {
        return await provider();
      } catch (_error: unknown) {
        return defaultValue;
      }
    }

    const firstNinjaMaster: NinjaMaster = await valueOrDefault(
      ninjaMasterProvider,
      {
        rank: 'DefaultNinjaMaster',
      },
    );
    const secondNinjaMaster: NinjaMaster = await valueOrDefault(
      ninjaMasterProvider,
      {
        rank: 'DefaultNinjaMaster',
      },
    );

    expect(firstNinjaMaster.rank).toBe('DefaultNinjaMaster');
    expect(secondNinjaMaster.rank).toBe('NinjaMaster');
  });

  it('Should support custom arguments', async () => {
    const container: Container = new Container();

    interface Sword {
      material: string;
      damage: number;
    }

    @injectable()
    class Katana implements Sword {
      public material!: string;
      public damage!: number;
    }

    container.bind<Sword>('Sword').to(Katana);

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    type SwordProvider = Provider<Sword, [string, number]>;

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    container.bind<SwordProvider>('SwordProvider').toProvider(
      (context: ResolutionContext): SwordProvider =>
        async (material: string, damage: number) =>
          new Promise<Sword>(
            (resolve: (value: Sword | PromiseLike<Sword>) => void) => {
              setTimeout(() => {
                const katana: Sword = context.get<Sword>('Sword');
                katana.material = material;
                katana.damage = damage;
                resolve(katana);
              }, 10);
            },
          ),
    );

    const katanaProvider: SwordProvider =
      container.get<SwordProvider>('SwordProvider');

    const powerfulGoldKatana: Sword = await katanaProvider('gold', 100);

    expect(powerfulGoldKatana.material).toBe('gold');
    expect(powerfulGoldKatana.damage).toBe(100);

    const notSoPowerfulGoldKatana: Sword = await katanaProvider('gold', 10);

    expect(notSoPowerfulGoldKatana.material).toBe('gold');
    expect(notSoPowerfulGoldKatana.damage).toBe(10);
  });

  it('Should support the declaration of singletons', async () => {
    const container: Container = new Container();

    interface Warrior {
      level: number;
    }

    @injectable()
    class Ninja implements Warrior {
      public level: number;
      constructor() {
        this.level = 0;
      }
    }

    type WarriorProvider = (level: number) => Promise<Warrior>;

    container.bind<Warrior>('Warrior').to(Ninja).inSingletonScope(); // Value is singleton!

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    container.bind<WarriorProvider>('WarriorProvider').toProvider(
      (context: ResolutionContext) => async (increaseLevel: number) =>
        new Promise<Warrior>((resolve: (value: Warrior) => void) => {
          setTimeout(() => {
            const warrior: Warrior = context.get<Warrior>('Warrior');
            warrior.level += increaseLevel;
            resolve(warrior);
          }, 100);
        }),
    );

    const warriorProvider: WarriorProvider = container.get('WarriorProvider');

    const firstWarrior: Warrior = await warriorProvider(10);

    expect(firstWarrior.level).toBe(10);

    const secondWarrior: Warrior = await warriorProvider(10);

    expect(secondWarrior.level).toBe(20);
  });
});
