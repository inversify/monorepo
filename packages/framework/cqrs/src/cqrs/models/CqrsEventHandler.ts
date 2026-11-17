export interface CqrsEventHandler<TEvent extends object = object> {
  handle(event: TEvent): Promise<void> | void;
}
