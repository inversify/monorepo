// Is-inversify-import-example
import { Container, inject } from 'inversify8';

interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  public readonly damage: number = 10;
}

// Begin-example
export class LegendaryWarrior {
  constructor(
    @inject('Weapon') public readonly firstWeapon: Weapon,
    @inject('Weapon') public readonly secondWeapon: Weapon,
    @inject('Weapon') public readonly thirdWeapon: Weapon,
  ) {}
}

const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana).inRequestScope();
container.bind(LegendaryWarrior).toSelf();

const firstKatana: Weapon = container.get<Weapon>('Weapon');
const secondKatana: Weapon = container.get<Weapon>('Weapon');

const legendaryWarrior: LegendaryWarrior = container.get(LegendaryWarrior);

// Returns false
const isSameKatana: boolean = firstKatana === secondKatana;

// Returns true
const warriorHasSameKatana: boolean =
  legendaryWarrior.firstWeapon === legendaryWarrior.secondWeapon &&
  legendaryWarrior.secondWeapon === legendaryWarrior.thirdWeapon;
// End-example

export { isSameKatana, warriorHasSameKatana };
