``` ts
const weaponsModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind<Katana>('Weapon').to(Katana).whenNamed('Melee');
  },
);

// v7: async load (default)
await container.load(weaponsModule);

container.bind(Ninja).toSelf();

const ninja: Ninja = container.get(Ninja);
```
