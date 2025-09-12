export interface InterceptorTransformObject {
  push: (transform: (value: unknown) => unknown) => void;
}
