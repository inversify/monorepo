``` ts
const container: Container = new Container({ autoBindInjectable: true });

// returns a Ninja
container.bind(Ninja).to(NinjaMaster);
// returns NinjaMaster
container.get(Ninja);
```
