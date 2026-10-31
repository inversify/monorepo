export type Resolved<TActivated> =
  | SyncResolved<TActivated>
  | Promise<SyncResolved<TActivated>>;

export type SyncResolved<TActivated> = TActivated;
