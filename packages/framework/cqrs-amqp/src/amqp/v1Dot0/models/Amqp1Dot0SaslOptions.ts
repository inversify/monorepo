/**
 * The SASL mechanism used to authenticate. `external` takes the identity from
 * the TLS client certificate, so it requires `tls.cert`.
 */
export type Amqp1Dot0SaslOptions =
  | { readonly mechanism: 'anonymous' }
  | { readonly mechanism: 'external' }
  | {
      readonly mechanism: 'plain';
      readonly password: string;
      readonly username: string;
    };
