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
  .whenTargetNamed('fr');
container
  .bind<Intl>('Intl')
  .toConstantValue({ goodbye: 'au revoir' })
  .whenTargetNamed('fr');

container
  .bind<Intl>('Intl')
  .toConstantValue({ hello: 'hola' })
  .whenTargetNamed('es');
container
  .bind<Intl>('Intl')
  .toConstantValue({ goodbye: 'adios' })
  .whenTargetNamed('es');

const fr: Intl[] = container.getAllNamed<Intl>('Intl', 'fr');

const es: Intl[] = container.getAllNamed<Intl>('Intl', 'es');
// End-example

export { es, fr };
