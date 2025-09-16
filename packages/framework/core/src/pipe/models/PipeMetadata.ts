export interface PipeMetadata {
  targetClass: NewableFunction;
  methodName: string | symbol;
  parameterIndex: number;
}
