import type { CNFairResponse } from "../domain/cnfair.ts";
import type { PandabuyResponse } from "../domain/pandabuy.ts";
import { HttpError } from "../errors/HttpError.ts";

export interface FetchJsonInit {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export const fetchJson = async <T>(
  url: string,
  { body, method, headers = {} }: FetchJsonInit = {},
) => {
  if (!("Accept" in headers)) {
    headers["Accept"] = "application/json";
  }
  let payload: string | undefined;
  if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const init = { method, body: payload, headers };
  const response = await fetch(url, init);
  const data = await response.text();
  if (!response.ok) {
    throw new HttpError(response.status, !data ? null : JSON.parse(data));
  }
  if (data.length === 0) return null as T;
  return JSON.parse(data) as T;
};

export const fetchCNFair = <T>(
  path: string,
  { headers, ...init }: FetchJsonInit = {},
) => {
  const url = new URL(path, "https://cnfair.com/");
  return fetchJson<CNFairResponse<T>>(url.href, {
    ...init,
    headers: { lang: "en", ...headers },
  });
};

export interface FetchPandabuyInit extends FetchJsonInit {
  token?: string;
}

export const fetchPandabuy = async <T>(
  path: string,
  { token, headers = {}, ...init }: FetchPandabuyInit = {},
) => {
  const url = new URL(path, "https://www.pandabuy.com/");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const data = await fetchJson<PandabuyResponse<T>>(url.href, {
    ...init,
    headers: { lang: "en", ...headers },
  });
  if (data.code >= 400) {
    throw new HttpError(data.code, data, data.msg);
  }
  return data;
};
