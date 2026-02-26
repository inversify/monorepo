/* eslint-disable @typescript-eslint/no-deprecated */
/* eslint-disable @typescript-eslint/no-magic-numbers */
// Is-inversify-import-example
import { Container, injectable, ResolutionContext } from 'inversify7';

interface Sword {
  material: string;
  damage: number;
}

@injectable()
export class Katana implements Sword {
  public material!: string;
  public damage!: number;
}

type SwordProvider = (material: string, damage: number) => Promise<Sword>;

// Begin-example
export const container: Container = new Container();

container.bind<Sword>('Sword').to(Katana);

// v7: toProvider (deprecated)
container
  .bind<SwordProvider>('SwordProvider')
  .toProvider((context: ResolutionContext) => {
    return async (material: string, damage: number): Promise<Sword> => {
      return new Promise<Sword>(
        (resolve: (value: Sword | PromiseLike<Sword>) => void) => {
          setTimeout(() => {
            const sword: Sword = context.get<Sword>('Sword');
            sword.material = material;
            sword.damage = damage;
            resolve(sword);
          }, 10);
        },
      );
    };
  });
// End-example
