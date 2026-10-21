import { type OngoingCall } from '../../domain/models/OngoingCall.js';

export interface OngoingCallsFindQueryResult {
  readonly items: OngoingCall[];
  readonly total: number;
}
