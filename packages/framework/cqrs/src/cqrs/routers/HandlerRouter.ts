import { type ServiceIdentifier } from 'inversify';

// oxlint-disable-next-line typescript/no-unsafe-function-type
type InputType = Function;

export interface HandlerRouterRegistration {
  identifier: string | symbol | undefined;
  serviceIdentifier: ServiceIdentifier;
  type: InputType;
}

export abstract class HandlerRouter<TInput extends object, TResult> {
  readonly #identifierToInputTypeMap: Map<string | symbol, InputType>;
  readonly #inputTypeToResultMap: Map<InputType, TResult>;

  constructor() {
    this.#identifierToInputTypeMap = new Map();
    this.#inputTypeToResultMap = new Map();
  }

  public getRegisteredTypes(): Iterable<InputType> {
    return this.#inputTypeToResultMap.keys();
  }

  public register(registration: HandlerRouterRegistration): void {
    const mappedInputType: InputType | undefined =
      registration.identifier === undefined
        ? undefined
        : this.#identifierToInputTypeMap.get(registration.identifier);
    const resultInputType: InputType = mappedInputType ?? registration.type;
    const result: TResult = this._appendHandler(
      this.#inputTypeToResultMap.get(resultInputType),
      registration.serviceIdentifier,
      registration.type,
    );

    this.#inputTypeToResultMap.set(resultInputType, result);

    if (resultInputType !== registration.type) {
      this.#inputTypeToResultMap.set(registration.type, result);
    }

    if (
      registration.identifier !== undefined &&
      mappedInputType === undefined
    ) {
      this.#identifierToInputTypeMap.set(
        registration.identifier,
        registration.type,
      );
    }
  }

  public route(input: TInput): TResult | undefined {
    const result: TResult | undefined = this.#inputTypeToResultMap.get(
      input.constructor,
    );

    if (result !== undefined) {
      return result;
    }

    return this.#routeByIdentifier(input);
  }

  protected abstract _appendHandler(
    result: TResult | undefined,
    serviceIdentifier: ServiceIdentifier,
    inputType: InputType,
  ): TResult;

  protected abstract _getInputIdentifier(
    input: TInput,
  ): string | symbol | undefined;

  #routeByIdentifier(input: TInput): TResult | undefined {
    const inputIdentifier: string | symbol | undefined =
      this._getInputIdentifier(input);

    if (inputIdentifier === undefined) {
      return undefined;
    }

    const mappedInputType: InputType | undefined =
      this.#identifierToInputTypeMap.get(inputIdentifier);

    if (mappedInputType === undefined) {
      return undefined;
    }

    const result: TResult | undefined =
      this.#inputTypeToResultMap.get(mappedInputType);

    if (result === undefined) {
      return undefined;
    }

    this.#inputTypeToResultMap.set(input.constructor, result);

    return result;
  }
}
