``` ts
const warriorsModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind<Ninja>('Ninja').to(Ninja);
  },
);

const weaponsModule: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options.bind<Katana>('Weapon').to(Katana).whenNamed('Melee');
    options.bind<Shuriken>('Weapon').to(Shuriken).whenNamed('Ranged');
  },
);

container.load(warriorsModule, weaponsModule);

const ninja: Ninja = container.get('Ninja');
```
