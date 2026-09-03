``` ts
type Weapon = unknown;

@injectable()
abstract class BaseSoldier {
  public weapon: Weapon;
  constructor(@inject('Weapon') weapon: Weapon) {
    this.weapon = weapon;
  }
}

@injectable()
abstract class IntermediateSoldier extends BaseSoldier {}

@injectable()
@injectFromHierarchy({
  extendConstructorArguments: true,
  extendProperties: false,
})
class Soldier extends IntermediateSoldier {}

// Returns a soldier with a weapon
const soldier: Soldier = container.get(Soldier);
```
