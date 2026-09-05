``` ts
async function buildLevel1(): Promise<Level1> {
  return new Level1();
}

const container: Container = new Container();
container
  .bind('Level1')
  .toDynamicValue(async (): Promise<Level1> => buildLevel1());

const level1: Promise<Level1> = container.getAsync<Level1>('Level1');
```
