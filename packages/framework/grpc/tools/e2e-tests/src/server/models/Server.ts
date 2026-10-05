export interface Server {
  host: string;
  port: number;
  shutdown: () => Promise<void>;
}
