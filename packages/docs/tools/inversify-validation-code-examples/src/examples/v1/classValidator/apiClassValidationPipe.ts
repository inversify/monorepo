// Begin-example
import { ClassValidationPipe } from '@inversifyjs/class-validation';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { Container } from 'inversify';

const container: Container = new Container();

const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
  container,
  { logger: true },
);
adapter.useGlobalFilters(InversifyValidationErrorFilter);
adapter.useGlobalPipe(new ClassValidationPipe());
// End-example
