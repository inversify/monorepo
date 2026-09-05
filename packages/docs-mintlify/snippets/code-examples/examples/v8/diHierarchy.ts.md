``` ts
class Katana {}

const parentContainer: Container = new Container();
parentContainer.bind(weaponIdentifier).to(Katana);

const childContainer: Container = new Container({ parent: parentContainer });

const katana: Katana = childContainer.get(weaponIdentifier);
```
