``` ts
const weaponsModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind<Katana>('Weapon').to(Katana).whenNamed('Melee');
  },
);

// v8: sync load (default)
container.load(weaponsModule);

container.bind(Ninja).toSelf();

const ninja: Ninja = container.get(Ninja);
```
