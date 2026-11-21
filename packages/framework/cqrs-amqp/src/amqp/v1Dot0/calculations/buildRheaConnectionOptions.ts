import rhea, { type ConnectionOptions } from 'rhea';

import { type Amqp1Dot0ConnectionOptions } from '../models/Amqp1Dot0ConnectionOptions.js';
import { type Amqp1Dot0ReconnectOptions } from '../models/Amqp1Dot0ReconnectOptions.js';
import { type Amqp1Dot0SaslOptions } from '../models/Amqp1Dot0SaslOptions.js';
import { type Amqp1Dot0TlsOptions } from '../models/Amqp1Dot0TlsOptions.js';
import { buildBuffer } from './buildBuffer.js';
import { omitUndefined } from './omitUndefined.js';

// Rhea connects to 5672 when no port is set. The Node connect options require
// a port, so the value is filled in here rather than left for rhea.
const DEFAULT_AMQP_PORT: number = 5672;

type PemInput = string | Uint8Array;

type ClientMechanisms = ReturnType<typeof rhea.sasl.client_mechanisms>;

type CaMaterial = Buffer | string | (Buffer | string)[];

export type RheaConnectOptions = ConnectionOptions & {
  // Present on the TCP and TLS connect options. Intersecting it keeps `host`
  // visible on the IPC member of rhea's union as well.
  host: string;
  sasl_mechanisms?: ClientMechanisms;
};

function buildPem(pem: PemInput): Buffer | string {
  return typeof pem === 'string' ? pem : buildBuffer(pem);
}

function buildOptionalPem(
  pem: PemInput | undefined,
): Buffer | string | undefined {
  return pem === undefined ? undefined : buildPem(pem);
}

function buildCa(ca: Amqp1Dot0TlsOptions['ca']): CaMaterial | undefined {
  if (ca === undefined) {
    return undefined;
  }

  if (typeof ca === 'string' || ca instanceof Uint8Array) {
    return buildPem(ca);
  }

  return ca.map(buildPem);
}

function buildSaslMechanisms(
  sasl: Amqp1Dot0SaslOptions | undefined,
): ClientMechanisms | undefined {
  if (sasl === undefined) {
    return undefined;
  }

  const mechanisms: ClientMechanisms = rhea.sasl.client_mechanisms();

  switch (sasl.mechanism) {
    case 'anonymous':
      mechanisms.enable_anonymous('anonymous');
      break;
    case 'external':
      mechanisms.enable_external();
      break;
    case 'plain':
      mechanisms.enable_plain(sasl.username, sasl.password);
      break;
  }

  return mechanisms;
}

function buildSharedOptions(options: Amqp1Dot0ConnectionOptions): {
  readonly channel_max?: number;
  readonly container_id?: string;
  readonly host: string;
  readonly hostname: string;
  readonly idle_time_out?: number;
  readonly initial_reconnect_delay?: number;
  readonly max_frame_size?: number;
  readonly max_reconnect_delay?: number;
  readonly port: number;
  readonly reconnect: boolean;
  readonly reconnect_limit?: number;
  readonly sasl_mechanisms?: ClientMechanisms;
  readonly session_buffer_size?: number;
} {
  const reconnect: boolean | Amqp1Dot0ReconnectOptions =
    options.reconnect ?? true;
  const reconnectOptions: Amqp1Dot0ReconnectOptions =
    typeof reconnect === 'boolean' ? {} : reconnect;

  return omitUndefined({
    channel_max: options.channelMax,
    container_id: options.containerId,
    host: options.host,
    hostname: options.virtualHost ?? options.host,
    idle_time_out: options.idleTimeout,
    initial_reconnect_delay: reconnectOptions.initialDelay,
    max_frame_size: options.maxFrameSize,
    max_reconnect_delay: reconnectOptions.maxDelay,
    port: options.port ?? DEFAULT_AMQP_PORT,
    reconnect: reconnect !== false,
    reconnect_limit: reconnectOptions.limit,
    sasl_mechanisms: buildSaslMechanisms(options.sasl),
    session_buffer_size: options.sessionBufferSize,
  });
}

export function buildRheaConnectionOptions(
  options: Amqp1Dot0ConnectionOptions,
): RheaConnectOptions {
  const shared: ReturnType<typeof buildSharedOptions> =
    buildSharedOptions(options);
  const tls: Amqp1Dot0TlsOptions | undefined = options.tls;

  if (tls === undefined) {
    return shared;
  }

  return omitUndefined({
    ...shared,
    ca: buildCa(tls.ca),
    cert: buildOptionalPem(tls.cert),
    key: buildOptionalPem(tls.key),
    rejectUnauthorized: tls.rejectUnauthorized,
    servername: tls.serverName,
    transport: 'tls' as const,
  });
}
