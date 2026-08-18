export interface ParsedJsonSchemaReference {
  /** The fragment, when it is a plain name one. */
  anchor: string | undefined;
  /** Whether the reference carries no path part, so it targets the current resource. */
  isLocal: boolean;
  /** The reference exactly as it appears in the schema. */
  value: string;
}
