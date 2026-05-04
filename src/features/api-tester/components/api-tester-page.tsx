"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ApiTesterError as ApiTesterClientError,
  sendApiRequest,
} from "../lib/api-tester-client";
import { buildCurl } from "../lib/curl-builder";
import { buildUrl, paramsFromUrl, toRecord } from "../lib/key-value-utils";
import type {
  ApiTesterError,
  ApiTesterResponse,
  HttpMethod,
  KeyValue,
  RequestRecord,
} from "../lib/types";
import { HistoryList } from "./history-list";
import { RequestForm } from "./request-form";
import { ResponseViewer } from "./response-viewer";

const HISTORY_LIMIT = 50;

export function ApiTesterPage() {
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [urlBase, setUrlBase] = useState("");
  const [params, setParams] = useState<KeyValue[]>([]);
  const [headers, setHeaders] = useState<KeyValue[]>([]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ApiTesterResponse | undefined>();
  const [error, setError] = useState<ApiTesterError | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<RequestRecord[]>([]);

  const urlInput = useMemo(() => buildUrl(urlBase, params), [urlBase, params]);

  const handleUrlInputChange = useCallback((next: string) => {
    const parsed = paramsFromUrl(next);
    if (!parsed) {
      setUrlBase("");
      setParams([]);
      return;
    }
    setUrlBase(parsed.base);
    setParams(parsed.params);
  }, []);

  const curlCommand = useMemo(() => {
    if (!urlBase.trim()) return "";
    return buildCurl({
      method,
      url: urlInput,
      headers: toRecord(headers),
      body: methodAllowsBody(method) && body ? body : null,
    });
  }, [method, urlInput, urlBase, headers, body]);

  const handleSend = useCallback(async () => {
    if (!urlInput.trim() || isLoading) return;
    setIsLoading(true);
    setResponse(undefined);
    setError(undefined);

    const recordBase = {
      id: crypto.randomUUID(),
      method,
      url: urlInput,
      params,
      headers,
      body,
      timestamp: new Date(),
    };

    try {
      const apiResponse = await sendApiRequest({
        method,
        url: urlInput,
        headers: toRecord(headers),
        body: methodAllowsBody(method) ? body : null,
      });
      setResponse(apiResponse);
      setHistory((prev) =>
        [{ ...recordBase, response: apiResponse }, ...prev].slice(0, HISTORY_LIMIT)
      );
    } catch (e) {
      const errorPayload: ApiTesterError =
        e instanceof ApiTesterClientError
          ? { error: e.message, errorCode: e.errorCode }
          : {
              error: e instanceof Error ? e.message : "送信に失敗しました。",
              errorCode: "UNKNOWN_ERROR",
            };
      setError(errorPayload);
      setHistory((prev) =>
        [{ ...recordBase, error: errorPayload }, ...prev].slice(0, HISTORY_LIMIT)
      );
    } finally {
      setIsLoading(false);
    }
  }, [body, headers, isLoading, method, params, urlInput]);

  const handleSelectHistory = useCallback((record: RequestRecord) => {
    setMethod(record.method);
    setParams(record.params);
    setHeaders(record.headers);
    setBody(record.body);
    setResponse(record.response);
    setError(record.error);
    const parsed = paramsFromUrl(record.url);
    setUrlBase(parsed?.base ?? record.url);
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Tester</h1>
        <p className="mt-2 text-muted-foreground">
          REST API へリクエストを送信し、レスポンスを整形表示・cURL 形式で出力できます。
          リクエストはサーバー経由で送信されるため CORS の影響を受けません。
        </p>
      </div>

      <RequestForm
        method={method}
        urlInput={urlInput}
        params={params}
        headers={headers}
        body={body}
        isLoading={isLoading}
        curlCommand={curlCommand}
        onMethodChange={setMethod}
        onUrlInputChange={handleUrlInputChange}
        onParamsChange={setParams}
        onHeadersChange={setHeaders}
        onBodyChange={setBody}
        onSend={handleSend}
      />

      <ResponseViewer response={response} error={error} />

      <section className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">履歴</h2>
        <HistoryList
          history={history}
          onSelect={handleSelectHistory}
          onClear={handleClearHistory}
        />
      </section>
    </div>
  );
}

function methodAllowsBody(method: HttpMethod): boolean {
  return method !== "GET" && method !== "DELETE";
}
