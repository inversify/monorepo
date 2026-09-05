``` ts
const warriorsModule: ContainerModule = new ContainerModule(
  (bind: interfaces.Bind) => {
    bind<Ninja>('Ninja').to(Ninja);
  },
);

const weaponsModule: ContainerModule = new ContainerModule(
  (
    bind: interfaces.Bind,
    _unbind: interfaces.Unbind,
    _isBound: interfaces.IsBound,
    _rebind: interfaces.Rebind,
    _unbindAsync: interfaces.UnbindAsync,
    _onActivation: interfaces.Container['onActivation'],
    _onDeactivation: interfaces.Container['onDeactivation'],
  ) => {
    bind<Katana>('Weapon').to(Katana).whenTargetNamed('Melee');
    bind<Shuriken>('Weapon').to(Shuriken).whenTargetNamed('Ranged');
  },
);

const container: Container = new Container();
container.load(warriorsModule, weaponsModule);

const ninja: Ninja = container.get('Ninja');
```
