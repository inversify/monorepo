// The published inversify8 alias does not include inspectCurrentPlan yet.
// Is-inversify-import-example
import {
  Container,
  inject,
  injectable,
  named,
  type PlanServiceInspection,
} from 'inversify8';

interface Weapon {
  damage: number;
}

@injectable()
class Katana implements Weapon {
  public readonly damage: number = 10;
}

// Begin-example
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
// End-example

export { weaponArgument };
