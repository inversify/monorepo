export interface MessageEvent {
  data: string | string[];
  id?: string;
  retry?: number;
  type?: string;
}
