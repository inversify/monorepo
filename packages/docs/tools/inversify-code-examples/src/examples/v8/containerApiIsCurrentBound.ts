// Is-inversify-import-example
import { Container, injectable } from 'inversify8';

// Begin-example
interface Warrior {
  kind: string;
}

const katanaSymbol: symbol = Symbol.for('Katana');
const warriorSymbol: symbol = Symbol.for('Warrior');

@injectable()
class Ninja implements Warrior {
  public readonly kind: string = 'ninja';
}

@injectable()
class Katana {}

const container: Container = new Container();
container.bind<Warrior>(Ninja).to(Ninja);
container.bind<Warrior>(warriorSymbol).to(Ninja);

const containerChild: Container = new Container({ parent: container });

containerChild.bind<Katana>(Katana).to(Katana);
containerChild.bind<Katana>(katanaSymbol).to(Katana);

// returns false
const isNinjaBound: boolean = containerChild.isCurrentBound(Ninja);
// returns false
const isWarriorSymbolBound: boolean =
  containerChild.isCurrentBound(warriorSymbol);
// returns true
const isKatanaBound: boolean = containerChild.isCurrentBound(Katana);
// returns true
const isKatanaSymbolBound: boolean =
  containerChild.isCurrentBound(katanaSymbol);

// End-example

export {
  isKatanaBound,
  isKatanaSymbolBound,
  isNinjaBound,
  isWarriorSymbolBound,
};
