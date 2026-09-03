``` ts
export const container: Container = new Container();

container.bind<Sword>('Sword').to(Katana);

// v7: toProvider (deprecated)
container
  .bind<SwordProvider>('SwordProvider')
  .toProvider((context: ResolutionContext) => {
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
