import { MessageEvent } from '../models/MessageEvent';

function stringifyData(data: string | string[]): string {
  if (Array.isArray(data)) {
    return data.map((line: string) => stringifyDataLine(line)).join('');
  }

  return stringifyDataLine(data);
}

function stringifyDataLine(line: string): string {
  return `data: ${line}\n`;
}

export function stringifyMessageEvent(messageEvent: MessageEvent): string {
  // Consider https://html.spec.whatwg.org/multipage/server-sent-events.html as reference
  const stringifiedType: string =
    messageEvent.type === undefined ? '' : `event: ${messageEvent.type}\n`;
  const stringifiedId: string =
    messageEvent.id === undefined ? '' : `id: ${messageEvent.id}\n`;
  const stringifiedRetry: string =
    messageEvent.retry === undefined
      ? ''
      : `retry: ${messageEvent.retry.toString()}\n`;
  const stringifiedData: string = stringifyData(messageEvent.data);

  return (
    stringifiedType + stringifiedId + stringifiedRetry + stringifiedData + '\n'
  );
}
