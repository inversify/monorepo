import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';

export interface ConstructorNoParamNode {
  readonly isNoParam: true;
  resolve: (params: ResolutionParams) => unknown;
}
