import { provide } from '@inversifyjs/binding-decorators';
import { type BindInWhenOnFluentSyntax, injectable } from 'inversify';

// Begin-example
@injectable()
@provide('Katana', (bind: BindInWhenOnFluentSyntax<Katana>) => {
  bind.inSingletonScope().whenNamed('GoldenKatana');
})
class Katana {
  public readonly damage: number = 10;
}
