export abstract class ValidationCache<TCacheEntry> {
  readonly #cache: Map<string, Map<string, TCacheEntry>>;

  constructor() {
    this.#cache = new Map();
  }

  public get(path: string, method: string): TCacheEntry | undefined {
    return this.#cache.get(path)?.get(method);
  }

  public getOrCreate(path: string, method: string): TCacheEntry {
    let cacheEntry: TCacheEntry | undefined = this.get(path, method);

    if (cacheEntry === undefined) {
      cacheEntry = this._createCacheEntry();
      this.set(path, method, cacheEntry);
    }

    return cacheEntry;
  }

  public set(path: string, method: string, cacheEntry: TCacheEntry): void {
    let methodMap: Map<string, TCacheEntry> | undefined = this.#cache.get(path);

    if (methodMap === undefined) {
      methodMap = new Map();
      this.#cache.set(path, methodMap);
    }

    methodMap.set(method, cacheEntry);
  }

  protected abstract _createCacheEntry(): TCacheEntry;
}
