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
  .whenTargetTagged('lang', 'fr');
container
  .bind<Intl>('Intl')
  .toDynamicValue(async () => ({ goodbye: 'au revoir' }))
  .whenTargetTagged('lang', 'fr');

container
  .bind<Intl>('Intl')
  .toDynamicValue(async () => ({ hello: 'hola' }))
  .whenTargetTagged('lang', 'es');
container
  .bind<Intl>('Intl')
  .toDynamicValue(async () => ({ goodbye: 'adios' }))
  .whenTargetTagged('lang', 'es');

const fr: Promise<Intl[]> = container.getAllTaggedAsync<Intl>(
  'Intl',
  'lang',
  'fr',
);

const es: Promise<Intl[]> = container.getAllTaggedAsync<Intl>(
  'Intl',
  'lang',
  'es',
);
// End-example

export { es, fr };
