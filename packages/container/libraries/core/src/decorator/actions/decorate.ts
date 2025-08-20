/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export function decorate(
  decorators: ClassDecorator | ClassDecorator[],
  target: Function,
): void;
export function decorate(
  decorators: ParameterDecorator | ParameterDecorator[],
  target: Function,
  parameterIndex: number,
): void;
export function decorate(
  decorators: ParameterDecorator | ParameterDecorator[],
  target: Function,
  methodName: string | symbol,
  parameterIndex: number,
): void;
export function decorate(
  decorators:
    | MethodDecorator
    | PropertyDecorator
    | MethodDecorator[]
    | PropertyDecorator[],
  target: Function,
  property: string | symbol,
): void;
export function decorate(
  decorators:
    | ClassDecorator
    | MethodDecorator
    | ParameterDecorator
    | PropertyDecorator
    | ClassDecorator[]
    | MethodDecorator[]
    | ParameterDecorator[]
    | PropertyDecorator[],
  target: Function,
  parameterIndexOrProperty?: number | string | symbol,
  parameterIndex?: number,
): void {
  const parsedDecorators:
    | ClassDecorator[]
    | MethodDecorator[]
    | ParameterDecorator[]
    | PropertyDecorator[] = Array.isArray(decorators)
    ? decorators
    : ([decorators] as
        | ClassDecorator[]
        | MethodDecorator[]
        | ParameterDecorator[]
        | PropertyDecorator[]);

  if (parameterIndexOrProperty === undefined) {
    // Asume ClassDecorator[]

    Reflect.decorate(parsedDecorators as ClassDecorator[], target);
    return;
  }

  if (typeof parameterIndexOrProperty === 'number') {
    // Asume ParameterDecorator[]

    for (const decorator of parsedDecorators as ParameterDecorator[]) {
      decorator(target, undefined, parameterIndexOrProperty);
    }

    return;
  }

  if (parameterIndex === undefined) {
    Reflect.decorate(
      parsedDecorators as MethodDecorator[] | PropertyDecorator[],
      target.prototype as object,
      parameterIndexOrProperty,
    );

    return;
  }

  for (const decorator of parsedDecorators as ParameterDecorator[]) {
    decorator(target, parameterIndexOrProperty, parameterIndex);
  }
}
