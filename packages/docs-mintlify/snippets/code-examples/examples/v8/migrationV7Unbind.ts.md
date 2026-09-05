``` ts
const container: Container = new Container();

container.bind<Weapon>('Weapon').to(Katana);

// v8: sync unbind (default)
container.unbind('Weapon');

const isBound: boolean = container.isBound('Weapon');
```
