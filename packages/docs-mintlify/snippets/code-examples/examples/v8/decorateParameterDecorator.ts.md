``` ts
@injectable()
class Warrior {
  private readonly weapon: Weapon;

  constructor(weapon: Weapon) {
    this.weapon = weapon;
  }

  public fight(): string {
    return `Fighting with weapon damage: ${this.weapon.damage.toString()}`;
  }
}

// Apply @inject decorator to constructor parameter using decorate function
decorate(inject('Weapon'), Warrior, 0);

const container: Container = new Container();
container.bind<Weapon>('Weapon').to(Katana);
container.bind<Warrior>('Warrior').to(Warrior);

const warrior: Warrior = container.get<Warrior>('Warrior');
```
