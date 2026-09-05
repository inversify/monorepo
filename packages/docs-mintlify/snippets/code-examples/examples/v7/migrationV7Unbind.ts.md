``` ts
const container: Container = new Container();

container.bind<Weapon>('Weapon').to(Katana);

// v7: sync unbind
container.unbindSync('Weapon');

const isBound: boolean = container.isBound('Weapon');
```
