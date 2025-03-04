import { MockInstance, vitest } from 'vitest';

// Is-inversify-import-example
import { Container } from 'inversify';

// Begin-example
interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  readonly #damage: number = 10;

  public get damage(): number {
    return this.#damage;
  }
}

const container: Container = new Container();

container.bind<Weapon>('Weapon').to(Katana).inSingletonScope();

container.get('Weapon');

// Exclude-from-example
export const katanaDamageSpy: MockInstance = vitest.spyOn<Weapon, 'damage'>(
  container.get<Weapon>('Weapon'),
  'damage',
  'get',
);

container.onDeactivation('Weapon', (weapon: Weapon): void | Promise<void> => {
  console.log(`Deactivating weapon with damage ${weapon.damage.toString()}`);
});

container.unbind('Weapon');
// End-example
