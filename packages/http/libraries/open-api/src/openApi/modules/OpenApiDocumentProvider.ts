import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { Container } from 'inversify';

export class OpenApiDocumentProvider {
  readonly #container: Container;
  readonly #openApiObject: OpenApi3Dot1Object;

  constructor(container: Container, openApiObject: OpenApi3Dot1Object) {
    this.#container = container;
    this.#openApiObject = openApiObject;
  }

  public get container(): Container {
    return this.#container;
  }

  public get document(): OpenApi3Dot1Object {
    return this.#openApiObject;
  }
}
