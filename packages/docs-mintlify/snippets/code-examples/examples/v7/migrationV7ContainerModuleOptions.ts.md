``` ts
const module: ContainerModule = new ContainerModule(
    (options: ContainerModuleLoadOptions) => {
      // v7: sync unbind and rebind
      options.unbindSync('Weapon');
      options.bind<Weapon>('Weapon').to(Shuriken);
    },
  );

  await container.load(module);
```
