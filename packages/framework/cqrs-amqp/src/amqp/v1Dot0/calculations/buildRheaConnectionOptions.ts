import rhea, { type ConnectionOptions } from 'rhea';

import { type Amqp1Dot0ConnectionOptions } from '../models/Amqp1Dot0ConnectionOptions.js';
import { type Amqp1Dot0ReconnectOptions } from '../models/Amqp1Dot0ReconnectOptions.js';
import { type Amqp1Dot0SaslOptions } from '../models/Amqp1Dot0SaslOptions.js';
import { type Amqp1Dot0TlsOptions } from '../models/Amqp1Dot0TlsOptions.js';
import { buildBuffer } from './buildBuffer.js';
import { omitUndefined } from './omitUndefined.js';

type PemInput = string | Uint8Array;

function buildPem(pem: PemInput): Buffer | string {
  return typeof pem === 'string' ? pem : buildBuffer(pem);
}

function buildOptionalPem(
  pem: PemInput | undefined,
): Buffer | string | undefined {
  return pem === undefined ? undefined : buildPem(pem);
}

function buildCa(
  ca: Amqp1Dot0TlsOptions['ca'],
): (Buffer | string)[] | Buffer | string | undefined {
  if (ca === undefined || typeof ca === 'string' || ca instanceof Uint8Array) {
    return buildOptionalPem(ca);
  }

  return ca.map(buildPem);
}

function buildSaslMechanisms(sasl: Amqp1Dot0SaslOptions | undefined): unknown {
  if (sasl === undefined) {
    return undefined;
  }

  const mechanisms: ReturnType<typeof rhea.sasl.client_mechanisms> =
    rhea.sasl.client_mechanisms();

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

function buildTlsOptions(tls: Amqp1Dot0TlsOptions | undefined): object {
  if (tls === undefined) {
    return {};
  }

  return {
    ca: buildCa(tls.ca),
    cert: buildOptionalPem(tls.cert),
    key: buildOptionalPem(tls.key),
    rejectUnauthorized: tls.rejectUnauthorized,
    servername: tls.serverName,
    transport: 'tls',
  };
}

export function buildRheaConnectionOptions(
  options: Amqp1Dot0ConnectionOptions,
): ConnectionOptions {
  const reconnect: boolean | Amqp1Dot0ReconnectOptions =
    options.reconnect ?? true;
  const reconnectOptions: Amqp1Dot0ReconnectOptions =
    typeof reconnect === 'boolean' ? {} : reconnect;

  return omitUndefined({
    ...buildTlsOptions(options.tls),
    channel_max: options.channelMax,
    container_id: options.containerId,
    host: options.host,
    hostname: options.virtualHost,
    idle_time_out: options.idleTimeout,
    initial_reconnect_delay: reconnectOptions.initialDelay,
    max_frame_size: options.maxFrameSize,
    max_reconnect_delay: reconnectOptions.maxDelay,
    port: options.port,
    reconnect: reconnect !== false,
    reconnect_limit: reconnectOptions.limit,
    sasl_mechanisms: buildSaslMechanisms(options.sasl),
  }) as ConnectionOptions;
}
