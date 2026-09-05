``` ts
interface Weapon {
  damage: number;
}

export class Katana implements Weapon {
  readonly #damage: number = 10;

  public get damage(): number {
    return this.#damage;
  }

  @preDestroy()
  public onDeactivation(): void {
    console.log(`Deactivating weapon with damage ${this.damage.toString()}`);
  }
}

const container: Container = new Container();

container.bind<Weapon>('Weapon').to(Katana).inSingletonScope();

container.get('Weapon');

container.unbind('Weapon');
```
