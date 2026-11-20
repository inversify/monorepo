export interface Amqp1Dot0TlsOptions {
  /**
   * Trusted certificate authorities, in PEM format. Defaults to the Node.js
   * root certificates.
   */
  readonly ca?: string | Uint8Array | readonly (string | Uint8Array)[];
  /**
   * Client certificate chain, in PEM format.
   */
  readonly cert?: string | Uint8Array;
  /**
   * Client private key, in PEM format.
   */
  readonly key?: string | Uint8Array;
  /**
   * Defaults to `true`.
   */
  readonly rejectUnauthorized?: boolean;
  /**
   * Server name for SNI and certificate validation. Defaults to the host.
   */
  readonly serverName?: string;
}
