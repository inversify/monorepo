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
  .toDynamicValue(async () => ({ hello: 'bonjour' }))
  .whenTargetNamed('fr');
container
  .bind<Intl>('Intl')
  .toDynamicValue(async () => ({ goodbye: 'au revoir' }))
  .whenTargetNamed('fr');

container
  .bind<Intl>('Intl')
  .toDynamicValue(async () => ({ hello: 'hola' }))
  .whenTargetNamed('es');
container
  .bind<Intl>('Intl')
  .toDynamicValue(async () => ({ goodbye: 'adios' }))
  .whenTargetNamed('es');

const fr: Promise<Intl[]> = container.getAllNamedAsync<Intl>('Intl', 'fr');

const es: Promise<Intl[]> = container.getAllNamedAsync<Intl>('Intl', 'es');
// End-example

export { es, fr };
