export interface HttpInsightsProviderUrlOptions {
  readonly pattern?: RegExp;
}

export interface HttpInsightsProviderOptions {
  readonly url?: HttpInsightsProviderUrlOptions;
}
