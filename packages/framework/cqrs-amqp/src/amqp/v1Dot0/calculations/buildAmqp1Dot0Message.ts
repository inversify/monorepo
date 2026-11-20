import { type Message } from 'rhea';

import { type Amqp1Dot0List } from '../models/Amqp1Dot0List.js';
import { type Amqp1Dot0Message } from '../models/Amqp1Dot0Message.js';
import { type Amqp1Dot0MessageBody } from '../models/Amqp1Dot0MessageBody.js';
import { type Amqp1Dot0MessageHeader } from '../models/Amqp1Dot0MessageHeader.js';
import { type Amqp1Dot0MessageId } from '../models/Amqp1Dot0MessageId.js';
import { type Amqp1Dot0MessageProperties } from '../models/Amqp1Dot0MessageProperties.js';
import { type Amqp1Dot0Value } from '../models/Amqp1Dot0Value.js';
import { buildAmqp1Dot0Value } from './buildAmqp1Dot0Value.js';
import { omitUndefined } from './omitUndefined.js';

const DATA_SECTION_TYPECODE: number = 0x75;

// Fields of a message decoded by rhea, which flattens the header and
// properties sections. rhea types user_id as a string, but decodes the AMQP
// binary it is.
interface RheaReceivedMessage {
  absolute_expiry_time?: Date;
  application_properties?: Record<string, unknown>;
  body?: unknown;
  content_encoding?: string;
  content_type?: string;
  correlation_id?: Amqp1Dot0MessageId;
  creation_time?: Date;
  delivery_annotations?: Record<string, unknown>;
  delivery_count?: number;
  durable?: boolean;
  first_acquirer?: boolean;
  footer?: Record<string, unknown>;
  group_id?: string;
  group_sequence?: number;
  message_annotations?: Record<string, unknown>;
  message_id?: Amqp1Dot0MessageId;
  priority?: number;
  reply_to?: string;
  reply_to_group_id?: string;
  subject?: string;
  to?: string;
  ttl?: number;
  user_id?: Uint8Array;
}

// Data and sequence sections are decoded into rhea sections, which expose
// collect_sections().
interface RheaSection {
  collect_sections: unknown;
  content: unknown;
  multiple?: boolean;
  typecode: number;
}

function isRheaSection(body: unknown): body is RheaSection {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as Partial<RheaSection>).collect_sections === 'function'
  );
}

function buildBody(body: unknown): Amqp1Dot0MessageBody {
  if (!isRheaSection(body)) {
    return { kind: 'value', value: buildAmqp1Dot0Value(body) };
  }

  const contents: unknown[] =
    body.multiple === true ? (body.content as unknown[]) : [body.content];

  if (body.typecode === DATA_SECTION_TYPECODE) {
    return {
      kind: 'data',
      sections: contents as Uint8Array[],
    };
  }

  return {
    kind: 'sequence',
    sections: contents.map(buildSequenceList),
  };
}

function buildSequenceList(list: unknown): Amqp1Dot0List {
  if (!Array.isArray(list)) {
    throw new Error('Unsupported AMQP 1.0 sequence section');
  }

  return {
    items: list.map(buildAmqp1Dot0Value),
    kind: 'list',
  };
}

function buildMap(
  map: Record<string, unknown> | undefined,
): Record<string, Amqp1Dot0Value> | undefined {
  if (map === undefined) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(map).map(
      ([key, value]: [string, unknown]): [string, Amqp1Dot0Value] => [
        key,
        buildAmqp1Dot0Value(value),
      ],
    ),
  );
}

function omitEmpty<TRecord extends object>(
  record: TRecord,
): TRecord | undefined {
  return Object.keys(record).length === 0 ? undefined : record;
}

export function buildAmqp1Dot0Message(message: Message): Amqp1Dot0Message {
  const fields: RheaReceivedMessage = message as unknown as RheaReceivedMessage;

  const header: Amqp1Dot0MessageHeader = omitUndefined({
    deliveryCount: fields.delivery_count,
    durable: fields.durable,
    firstAcquirer: fields.first_acquirer,
    priority: fields.priority,
    ttl: fields.ttl,
  });

  const properties: Amqp1Dot0MessageProperties = omitUndefined({
    absoluteExpiryTime: fields.absolute_expiry_time,
    contentEncoding: fields.content_encoding,
    contentType: fields.content_type,
    correlationId: fields.correlation_id,
    creationTime: fields.creation_time,
    groupId: fields.group_id,
    groupSequence: fields.group_sequence,
    messageId: fields.message_id,
    replyTo: fields.reply_to,
    replyToGroupId: fields.reply_to_group_id,
    subject: fields.subject,
    to: fields.to,
    userId: fields.user_id,
  });

  return {
    body: buildBody(fields.body),
    ...omitUndefined({
      applicationProperties: buildMap(fields.application_properties),
      deliveryAnnotations: buildMap(fields.delivery_annotations),
      footer: buildMap(fields.footer),
      header: omitEmpty(header),
      messageAnnotations: buildMap(fields.message_annotations),
      properties: omitEmpty(properties),
    }),
  };
}
