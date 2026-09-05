``` ts
export const container: Container = new Container();

container.bind<Sword>('Sword').to(Katana);

// v8: use toFactory with async function instead of toProvider
container
  .bind<SwordProvider>('SwordProvider')
  .toFactory((context: ResolutionContext) => {
    return async (material: string, damage: number): Promise<Sword> => {
      return new Promise<Sword>(
        (resolve: (value: Sword | PromiseLike<Sword>) => void) => {
          setTimeout(() => {
            const sword: Sword = context.get<Sword>('Sword');
            sword.material = material;
            sword.damage = damage;
            resolve(sword);
          }, 10);
        },
      );
    };
  });
```
