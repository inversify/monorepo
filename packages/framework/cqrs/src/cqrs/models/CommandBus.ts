export interface CommandBus {
  send(command: object): Promise<void>;
}
