``` ts
const container: Container = new Container();

// Create initial binding
container.bind<Weapon>('Weapon').to(Katana);

// Get instance of Katana
const katana: Weapon = container.get<Weapon>('Weapon');
console.log(katana.damage); // 10

// Rebind synchronously to Shuriken
// This returns a BindToFluentSyntax to continue configuring the binding
container.rebindSync<Weapon>('Weapon').to(Shuriken);

// Get instance of Shuriken
const shuriken: Weapon = container.get<Weapon>('Weapon');
console.log(shuriken.damage);
```
