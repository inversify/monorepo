// Is-inversify-import-example
import { Container } from 'inversify6';

// Begin-example
const divisor: string = 'divisor';
const invalidDivisor: string = 'InvalidDivisor';
const validDivisor: string = 'ValidDivisor';
const container: Container = new Container();

container
  .bind<number>(divisor)
  .toConstantValue(0)
  .whenTargetNamed(invalidDivisor);

// returns true
const isDivisorBoundInInvalidDivisorName: boolean = container.isBoundNamed(
  divisor,
  invalidDivisor,
);

container
  .bind<number>(divisor)
  .toConstantValue(1)
  .whenTargetNamed(validDivisor);

// returns true
const isDivisorBoundInValidDivisorName: boolean = container.isBoundNamed(
  divisor,
  validDivisor,
);
// End-example

export { isDivisorBoundInInvalidDivisorName, isDivisorBoundInValidDivisorName };
