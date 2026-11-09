```ts
@injectable()
class Ninja {
  constructor(
    @inject('Weapon') @named('melee') public readonly weapon: Weapon,
  ) {}
}

const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana).whenNamed('melee');
container.bind(Ninja).toSelf();

const inspection = container.inspectCurrentPlan(Ninja);

if (
  inspection.root.isMultiple ||
  inspection.root.binding?.type !== 'Instance'
) {
  throw new Error('Expected Ninja to be planned as a single instance');
}

const weaponArgument: PlanServiceInspection | undefined =
  inspection.root.binding.constructorArguments[0];
```
