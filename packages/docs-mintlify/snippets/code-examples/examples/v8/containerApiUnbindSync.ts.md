``` ts
const container: Container = new Container();

// Create a binding
container.bind<Weapon>('Weapon').to(Katana);

// Check if it's bound
console.log(container.isBound('Weapon')); // true

// Synchronously unbind the service
container.unbind('Weapon');

// Verify it's unbound
console.log(container.isBound('Weapon'));
```
