``` ts
const ninjaId: symbol = Symbol.for('Ninja');
const weaponId: symbol = Symbol.for('Weapon');

@injectable()
class Ninja {
  constructor(
    @inject(weaponId)
    @named('shuriken')
    public readonly weapon: Weapon,
  ) {}
}

container.bind<Ninja>(ninjaId).to(Ninja);

const whenTargetNamedConstraint: (
  name: string,
) => (bindingconstraints: BindingConstraints) => boolean =
  (name: string) =>
  (bindingconstraints: BindingConstraints): boolean =>
    bindingconstraints.name === name;

container
  .bind<Weapon>(weaponId)
  .to(Katana)
  .when(whenTargetNamedConstraint('katana'));

container
  .bind<Weapon>(weaponId)
  .to(Shuriken)
  .when(whenTargetNamedConstraint('shuriken'));

const ninja: Ninja = container.get(ninjaId);

// Returns 5
const ninjaDamage: number = ninja.weapon.damage;
```
