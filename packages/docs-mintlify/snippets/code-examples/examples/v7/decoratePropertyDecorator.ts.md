``` ts
@injectable()
class Warrior {
  public weapon!: Weapon;

  public fight(): string {
    return `Fighting with weapon damage: ${this.weapon.damage.toString()}`;
  }
}

// Apply @inject decorator to property using decorate function
decorate(inject('Weapon'), Warrior, 'weapon');

const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana);
container.bind<Warrior>('Warrior').to(Warrior);

const warrior: Warrior = container.get<Warrior>('Warrior');
```
