import { type ChatMessage } from '../generated/hero.js';

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'text' in value && typeof value.text === 'string';
}

export function isChatMessageList(value: unknown): value is ChatMessage[] {
  return Array.isArray(value) && value.every(isChatMessage);
}
