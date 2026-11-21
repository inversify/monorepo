import rhea from 'rhea';

import { type Amqp1Dot0List } from '../models/Amqp1Dot0List.js';
import { type Amqp1Dot0Message } from '../models/Amqp1Dot0Message.js';
import { type Amqp1Dot0MessageBody } from '../models/Amqp1Dot0MessageBody.js';
import { type Amqp1Dot0MessageId } from '../models/Amqp1Dot0MessageId.js';
import { type Amqp1Dot0Value } from '../models/Amqp1Dot0Value.js';
import { buildBuffer } from './buildBuffer.js';
import { buildRheaValue } from './buildRheaValue.js';
import { omitUndefined } from './omitUndefined.js';

// What we hand to rhea's sender. rhea's Message type says user_id is a string
// and message ids are string | number | Buffer. On the wire user_id is binary,
// and a binary id has to be a wrapped binary or rhea encodes a Buffer as a uuid.
export interface RheaSendableMessage {
  readonly absolute_expiry_time?: Date;
  readonly application_properties?: Record<string, unknown>;
  readonly body: unknown;
  readonly content_encoding?: string;
  readonly content_type?: string;
  readonly correlation_id?: unknown;
  readonly creation_time?: Date;
  readonly delivery_annotations?: Record<string, unknown>;
  readonly delivery_count?: number;
  readonly durable?: boolean;
  readonly first_acquirer?: boolean;
  readonly footer?: Record<string, unknown>;
  readonly group_id?: string;
  readonly group_sequence?: number;
  readonly message_annotations?: Record<string, unknown>;
  readonly message_id?: unknown;
  readonly priority?: number;
  readonly reply_to?: string;
  readonly reply_to_group_id?: string;
  readonly subject?: string;
  readonly to?: string;
  readonly ttl?: number;
  readonly user_id?: Buffer;
}

function buildRheaBody(body: Amqp1Dot0MessageBody): unknown {
  switch (body.kind) {
    case 'data': {
      const sections: Buffer[] = body.sections.map(buildBuffer);
      const [section]: (Buffer | undefined)[] = sections;

      return sections.length === 1 && section !== undefined
        ? rhea.message.data_section(section)
        : rhea.message.data_sections(sections);
    }
    case 'sequence': {
      const sections: unknown[][] = body.sections.map(
        (section: Amqp1Dot0List): unknown[] =>
          section.items.map(buildRheaValue),
      );
      const [section]: (unknown[] | undefined)[] = sections;

      return sections.length === 1 && section !== undefined
        ? rhea.message.sequence_section(section)
        : rhea.message.sequence_sections(sections);
    }
    case 'value':
      return buildRheaValue(body.value);
  }
}

// rhea sends Buffer ids as uuids, so binary ids are wrapped explicitly.
function buildRheaMessageId(
  messageId: Amqp1Dot0MessageId | undefined,
): unknown {
  return messageId instanceof Uint8Array
    ? rhea.types.wrap_binary(buildBuffer(messageId))
    : messageId;
}

function buildRheaRecord(
  record: Readonly<Record<string, Amqp1Dot0Value>> | undefined,
): Record<string, unknown> | undefined {
  if (record === undefined) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(record).map(
      ([key, value]: [string, Amqp1Dot0Value]): [string, unknown] => [
        key,
        buildRheaValue(value),
      ],
    ),
  );
}

export function buildRheaMessage(
  message: Amqp1Dot0Message,
): RheaSendableMessage {
  const { header, properties } = message;

  return {
    ...omitUndefined({
      absolute_expiry_time: properties?.absoluteExpiryTime,
      application_properties: buildRheaRecord(message.applicationProperties),
      content_encoding: properties?.contentEncoding,
      content_type: properties?.contentType,
      correlation_id: buildRheaMessageId(properties?.correlationId),
      creation_time: properties?.creationTime,
      delivery_annotations: buildRheaRecord(message.deliveryAnnotations),
      delivery_count: header?.deliveryCount,
      durable: header?.durable,
      first_acquirer: header?.firstAcquirer,
      footer: buildRheaRecord(message.footer),
      group_id: properties?.groupId,
      group_sequence: properties?.groupSequence,
      message_annotations: buildRheaRecord(message.messageAnnotations),
      message_id: buildRheaMessageId(properties?.messageId),
      priority: header?.priority,
      reply_to: properties?.replyTo,
      reply_to_group_id: properties?.replyToGroupId,
      subject: properties?.subject,
      to: properties?.to,
      ttl: header?.ttl,
      user_id:
        properties?.userId === undefined
          ? undefined
          : buildBuffer(properties.userId),
    }),
    body: buildRheaBody(message.body),
  };
}
