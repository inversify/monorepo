``` ts
const weaponsModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind<Katana>('Weapon').to(Katana);
  },
);

container.load(weaponsModule);

// v8: sync unload (default)
container.unload(weaponsModule);

export const isBound: boolean = container.isBound('Weapon');
```
