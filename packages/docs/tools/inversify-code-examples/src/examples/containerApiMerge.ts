/* eslint-disable @typescript-eslint/typedef */
// Is-inversify-import-example
import { Container, injectable, interfaces } from 'inversify6';

// Begin-example
@injectable()
class Ninja {
  public readonly name: string = 'Ninja';
}

@injectable()
class Shuriken {
  public readonly name: string = 'Shuriken';
}

const NINJA_EXPANSION_TYPES = {
  Ninja: 'Ninja',
  Shuriken: 'Shuriken',
} satisfies Record<string, string>;

const ninjaExpansionContainer: Container = new Container();

ninjaExpansionContainer.bind<Ninja>(NINJA_EXPANSION_TYPES.Ninja).to(Ninja);
ninjaExpansionContainer
  .bind<Shuriken>(NINJA_EXPANSION_TYPES.Shuriken)
  .to(Shuriken);

@injectable()
class Samurai {
  public readonly name: string = 'Samurai';
}

@injectable()
class Katana {
  public name = 'Katana';
}

const SAMURAI_EXPANSION_TYPES = {
  Katana: 'Katana',
  Samurai: 'Samurai',
} satisfies Record<string, string>;

const samuraiExpansionContainer: Container = new Container();
samuraiExpansionContainer
  .bind<Samurai>(SAMURAI_EXPANSION_TYPES.Samurai)
  .to(Samurai);
samuraiExpansionContainer
  .bind<Katana>(SAMURAI_EXPANSION_TYPES.Katana)
  .to(Katana);

const gameContainer: interfaces.Container = Container.merge(
  ninjaExpansionContainer,
  samuraiExpansionContainer,
);

// End-example

export {
  gameContainer,
  Katana,
  Ninja,
  NINJA_EXPANSION_TYPES,
  Samurai,
  SAMURAI_EXPANSION_TYPES,
  Shuriken,
};
