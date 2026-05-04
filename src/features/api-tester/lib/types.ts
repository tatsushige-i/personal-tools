export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export type KeyValue = {
  id: string;
  enabled: boolean;
  key: string;
  value: string;
};

export type ApiTesterRequest = {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string | null;
};

export type ApiTesterResponse = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  truncated: boolean;
  durationMs: number;
};

export type ApiTesterError = {
  error: string;
  errorCode: string;
};

export type RequestRecord = {
  id: string;
  method: HttpMethod;
  url: string;
  params: KeyValue[];
  headers: KeyValue[];
  body: string;
  response?: ApiTesterResponse;
  error?: ApiTesterError;
  timestamp: Date;
};
