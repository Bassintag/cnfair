import type { CNFairResponse } from "../domain/cnfair.ts";
import type { PandabuyResponse } from "../domain/pandabuy.ts";
import { HttpError } from "../errors/HttpError.ts";
import chalk from "chalk";
import { globalOptions } from "./options.ts";
import { CloudflareError } from "../errors/CloudflareError.ts";

interface LogHTTPParam {
  type: "req" | "res";
  url: string;
  code?: number;
  data?: string;
}

const logHttp = ({ type, url, code, data }: LogHTTPParam) => {
  const parts = [
    chalk.grey("[") + chalk.yellow("HTTP") + chalk.grey("]"),
    chalk.bold(type === "req" ? chalk.magenta(">>>") : chalk.green("<<<")),
    url,
  ];
  if (code != null) {
    const codeStr = code.toFixed(0);
    let fn =
      {
        "2": chalk.green,
        "3": chalk.cyan,
        "4": chalk.red,
        "5": chalk.magenta,
      }[codeStr[0]] ?? chalk.white;
    parts.push("(" + fn(codeStr) + ")");
  }
  console.log(...parts);
  if (data) {
    console.log(chalk.gray(data));
  }
};

export interface FetchJsonInit {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export const fetchJson = async <T>(
  url: string,
  { body, method, headers = {} }: FetchJsonInit = {},
) => {
  let payload: string | undefined;
  if (body) {
    headers["Content-Type"] = "application/json;charset=utf-8";
    payload = JSON.stringify(body);
  }
  if (globalOptions.logHttp) {
    logHttp({ type: "req", url });
  }
  const init = {
    method,
    body: payload,
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en",
      Connection: "keep-alive",
      currency: "USD",
      device: "pc",
      "User-Agent":
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0",
      ...headers,
    },
  };
  const response = await fetch(url, init);
  const data = await response.text();
  if (globalOptions.logHttp) {
    logHttp({ type: "res", url, code: response.status, data });
  }
  if (!response.ok) {
    throw new HttpError(response.status, !data ? null : JSON.parse(data));
  }
  if (data.includes("<title>Verification</title>")) {
    throw new CloudflareError("Blocked by cloudflare WAF");
  }
  if (data.length === 0) return null as T;
  return JSON.parse(data) as T;
};

export const fetchCNFair = async <T>(
  path: string,
  { headers, ...init }: FetchJsonInit = {},
) => {
  const url = new URL(path, "https://cnfair.com/");
  const data = await fetchJson<CNFairResponse<T>>(url.href, {
    ...init,
    headers: { lang: "en", ...headers },
  });
  if (data.code >= 400) {
    throw new HttpError(data.code, data, data.msg);
  }
  return data;
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
    headers: { lang: "en", Origin: "https://www.pandabuy.com", ...headers },
  });
  if (data.code >= 400) {
    throw new HttpError(data.code, data, data.msg);
  }
  return data;
};
