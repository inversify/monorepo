export interface ClassMetadataLifecycle {
  postConstructMethodNames: Set<string | symbol>;
  preDestroyMethodNames: Set<string | symbol>;
}
