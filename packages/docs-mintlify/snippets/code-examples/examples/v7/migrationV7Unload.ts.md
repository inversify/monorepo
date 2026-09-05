``` ts
const weaponsModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind<Katana>('Weapon').to(Katana);
  },
);

await container.load(weaponsModule);

// v7: sync unload
container.unloadSync(weaponsModule);

const isBound: boolean = container.isBound('Weapon');
```
