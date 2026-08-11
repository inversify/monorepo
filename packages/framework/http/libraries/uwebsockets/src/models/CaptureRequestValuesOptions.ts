export interface CaptureRequestValuesOptions {
  body?: boolean;
  headers?: boolean;
  method?: boolean;
  params?: false | string[];
  query?: boolean;
  url?: boolean;
}
