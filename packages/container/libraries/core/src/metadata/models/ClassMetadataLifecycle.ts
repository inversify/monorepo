export interface ClassMetadataLifecycle {
  postConstructMethodNames: (string | symbol)[];
  preDestroyMethodNames: (string | symbol)[];
}
