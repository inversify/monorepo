``` ts
const serviceId: string = 'serviceId';

const container: Container = new Container();
container.bind<number>(serviceId).toConstantValue(1);
container.bind<number>(serviceId).toConstantValue(2);

// returns [1, 2]
const valuesBeforeRebind: number[] = container.getAll(serviceId);

container.rebind<number>(serviceId).toConstantValue(3);

// returns [3]
const valuesAfterRebind: number[] = container.getAll(serviceId);
```
