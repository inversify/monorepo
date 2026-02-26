// Shift-line-spaces-2
// Is-inversify-import-example
import { Container } from 'inversify8';

void (async () => {
  // Begin-example
  interface Weapon {
    damage: number;
  }

  class Katana implements Weapon {
    readonly #damage: number = 10;

    public get damage(): number {
      return this.#damage;
    }
  }

  const container: Container = new Container();

  container.bind<Weapon>('Weapon').to(Katana).inSingletonScope();

  container.get('Weapon');

  container.onDeactivation('Weapon', (weapon: Weapon): void | Promise<void> => {
    console.log(`Deactivating weapon with damage ${weapon.damage.toString()}`);
  });

  container.unbind('Weapon');
  // End-example
})();
