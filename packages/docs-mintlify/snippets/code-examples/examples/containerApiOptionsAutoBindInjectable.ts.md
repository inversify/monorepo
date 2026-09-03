``` ts
const container: Container = new Container({ autoBindInjectable: true });

// returns false
container.isBound(Ninja);
// returns a Ninja
container.get(Ninja);
// returns true
container.isBound(Ninja);
```
