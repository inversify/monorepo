``` ts
type Weapon = unknown;

@injectable()
abstract class BaseSoldier {
  @inject('Weapon')
  public weapon: Weapon;
}

@injectable()
abstract class IntermediateSoldier extends BaseSoldier {}

@injectable()
@injectFromHierarchy({
  extendConstructorArguments: false,
  extendProperties: true,
})
class Soldier extends IntermediateSoldier {}

// Returns a soldier with a weapon
const soldier: Soldier = container.get(Soldier);
```
