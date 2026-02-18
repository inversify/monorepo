import { type Binding } from '../../binding/models/Binding.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BaseBindingNode<TBinding extends Binding<any> = Binding<any>> {
  readonly binding: TBinding;
}
