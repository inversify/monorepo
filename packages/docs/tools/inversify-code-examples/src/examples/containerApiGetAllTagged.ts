// Is-inversify-import-example
import { Container } from 'inversify6';

// Begin-example
const container: Container = new Container();

interface Intl {
  hello?: string;
  goodbye?: string;
}

container
  .bind<Intl>('Intl')
  .toConstantValue({ hello: 'bonjour' })
  .whenTargetTagged('lang', 'fr');
container
  .bind<Intl>('Intl')
  .toConstantValue({ goodbye: 'au revoir' })
  .whenTargetTagged('lang', 'fr');

container
  .bind<Intl>('Intl')
  .toConstantValue({ hello: 'hola' })
  .whenTargetTagged('lang', 'es');
container
  .bind<Intl>('Intl')
  .toConstantValue({ goodbye: 'adios' })
  .whenTargetTagged('lang', 'es');

const fr: Intl[] = container.getAllTagged<Intl>('Intl', 'lang', 'fr');

const es: Intl[] = container.getAllTagged<Intl>('Intl', 'lang', 'es');
// End-example

export { es, fr };
