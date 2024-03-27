import type { PandabuyExchangeRequest } from "../domain/pandabuy.ts";
import { fetchPandabuy } from "./fetch.ts";
import type { AppConfig } from "../domain/config.ts";
import { HttpError } from "../errors/HttpError.ts";

export const createPandabuyExchangeRequest = async (
  config: AppConfig,
  body: PandabuyExchangeRequest,
) => {
  let redeemed = false;
  while (!redeemed) {
    try {
      await fetchPandabuy("/gateway/mall/ep/exchange/submit", {
        body,
        method: "POST",
        token: config.pandabuyToken,
      });
      redeemed = true;
    } catch (e) {
      if (!(e instanceof HttpError)) {
        throw e;
      }
    }
    if (!redeemed) {
      await Bun.sleep(5_000);
    }
  }
};
