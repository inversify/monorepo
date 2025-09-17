import { AjvValidationPipe } from '@inversifyjs/ajv-validation';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import Ajv from 'ajv';
import { Container } from 'inversify';

const container: Container = new Container();

const ajv: Ajv = new Ajv();

const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
  container,
  { logger: true },
);
adapter.useGlobalFilters(InversifyValidationErrorFilter);
adapter.useGlobalPipe(new AjvValidationPipe(ajv));
