``` ts
const container: Container = new Container();

container.bind(Katana).toSelf().whenNamed('katana');

container.bind<Arsenal>('Arsenal').toResolvedValue(
  (weapon: Weapon): Arsenal => ({
    weapons: [weapon],
  }),
  [
    {
      name: 'katana',
      serviceIdentifier: Katana,
    },
  ],
);

const arsenal: Arsenal = container.get('Arsenal');
```
