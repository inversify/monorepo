export interface EventSink<TEvent> {
  emit(event: TEvent): void;
}
