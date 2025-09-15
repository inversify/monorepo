/* eslint-disable @typescript-eslint/no-deprecated */
/* eslint-disable @typescript-eslint/no-magic-numbers */
// Is-inversify-import-example
import { Container, injectable, ResolutionContext } from 'inversify7';

// Begin-example
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

type SwordProvider = (material: string, damage: number) => Promise<Sword>;

container.bind<Sword>('Sword').to(Katana);

container
  .bind<SwordProvider>('SwordProvider')
  .toProvider((context: ResolutionContext) => {
    return async (material: string, damage: number): Promise<Sword> => {
      // Custom args!
      return new Promise<Sword>(
        (resolve: (value: Sword | PromiseLike<Sword>) => void) => {
          setTimeout(() => {
            const katana: Sword = context.get<Sword>('Sword');
            katana.material = material;
            katana.damage = damage;
            resolve(katana);
          }, 10);
        },
      );
    };
  });

const katanaProvider: SwordProvider =
  container.get<SwordProvider>('SwordProvider');

const powerfulGoldKatana: Promise<Sword> = katanaProvider('gold', 100);

const notSoPowerfulGoldKatana: Promise<Sword> = katanaProvider('gold', 10);
// End-example

export { Katana, notSoPowerfulGoldKatana, powerfulGoldKatana };
