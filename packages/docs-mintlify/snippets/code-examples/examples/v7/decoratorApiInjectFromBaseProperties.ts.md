``` ts
type Weapon = unknown;

@injectable()
abstract class BaseSoldier {
  @inject('Weapon')
  public weapon: Weapon;
}

@injectable()
@injectFromBase({
  extendConstructorArguments: false,
  extendProperties: true,
})
class Soldier extends BaseSoldier {}

// Returns a soldier with a weapon
const soldier: Soldier = container.get(Soldier);
```
