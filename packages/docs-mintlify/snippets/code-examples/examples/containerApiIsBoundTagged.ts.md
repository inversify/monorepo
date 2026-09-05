``` ts
const divisor: string = 'divisor';
const container: Container = new Container();

container
  .bind<number>(divisor)
  .toConstantValue(0)
  .whenTargetTagged('isValidDivisor', false);

// returns true
const isDivisorBoundInIsValidDivisorFalseTag: boolean = container.isBoundTagged(
  divisor,
  'isValidDivisor',
  false,
);

container
  .bind<number>(divisor)
  .toConstantValue(1)
  .whenTargetTagged('isValidDivisor', true);

// returns true
const isDivisorBoundInIsValidDivisorTrueTag: boolean = container.isBoundTagged(
  divisor,
  'isValidDivisor',
  true,
);
```
