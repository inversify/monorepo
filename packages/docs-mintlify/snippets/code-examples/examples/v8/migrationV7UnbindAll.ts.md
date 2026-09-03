``` ts
const container: Container = new Container();

container.bind<Weapon>('Weapon').to(Katana);

// v8: sync unbindAll (default)
container.unbindAll();

const isBound: boolean = container.isBound('Weapon');
```
