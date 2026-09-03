``` ts
const module: ContainerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // v8: sync unbind and rebind (default)
    options.unbind('Weapon');
    options.bind<Weapon>('Weapon').to(Shuriken);
  },
);

container.load(module);
```
