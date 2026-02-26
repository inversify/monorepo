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

// returns true
const isNinjaBound: boolean = container.isBound(Ninja);
// returns true
const isWarriorSymbolBound: boolean = container.isBound(warriorSymbol);
// returns false
const isKatanaBound: boolean = container.isBound(Katana);
// returns false
const isKatanaSymbolBound: boolean = container.isBound(katanaSymbol);

// End-example

export {
  isKatanaBound,
  isKatanaSymbolBound,
  isNinjaBound,
  isWarriorSymbolBound,
};
