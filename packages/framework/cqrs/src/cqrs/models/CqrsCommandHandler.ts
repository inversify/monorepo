export interface CqrsCommandHandler<TCommand extends object = object> {
  handle(command: TCommand): Promise<void> | void;
}
