``` ts
const container: Container = new Container();

container.bind<Weapon>('Weapon').to(Katana);

// v7: sync unbindAll
container.unbindAllSync();

const isBound: boolean = container.isBound('Weapon');
```
