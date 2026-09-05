``` ts
const container: Container = new Container({ defaultScope: 'Singleton' });

// You can configure the scope when declaring bindings:
container.bind<Warrior>(warriorServiceId).to(Ninja).inTransientScope();
```
