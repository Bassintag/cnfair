import task from "tasuku";
import { loadConfig } from "../utils/config.ts";
import { validateToken } from "../utils/token.ts";
import {
  type CNFairDetails,
  CNFairProductStatus,
  type CNFairResponse,
} from "../domain/cnfair.ts";
import { fetchCNFair, fetchPandabuy } from "../utils/fetch.ts";
import { HttpError } from "../errors/HttpError.ts";
import {
  type PandabuyExchangeRequest,
  PandabuyExchangeWay,
} from "../domain/pandabuy.ts";

export interface RedeemOptions {
  delay: number;
  way: "points" | "balance";
}

export const redeem = async (
  productIds: string[],
  { way, delay }: RedeemOptions,
) => {
  const config = await loadConfig();
  validateToken(config);

  await Promise.allSettled(
    productIds.map((productId) => {
      return task(productId, async ({ task }) => {
        let redeemCode = "";

        return task.group((task) => [
          task("Retrieving product code", async ({ setOutput, setTitle }) => {
            redeemCode = await runEveryUntil(async () => {
              let body: CNFairResponse<CNFairDetails>;
              try {
                body = await fetchCNFair<CNFairDetails>(
                  `gateway/mall/ep/item/detail?itemNo=${productId}`,
                );
              } catch (e) {
                if (!(e instanceof HttpError)) {
                  throw e;
                }
                setOutput(`Invalid HTTP status: ${e.code} (${e.message})`);
                return "";
              }
              switch (body.data.status) {
                case CNFairProductStatus.REDEEMED:
                  throw new Error("Product already redeemed");
                case CNFairProductStatus.AVAILABLE_SOON:
                  setOutput("Not yet available");
                  break;
              }
              return body.data.exchangeCode;
            }, delay * 1_000);
            setOutput(redeemCode);
            setTitle("Got product code");
          }),

          task("Waiting for product code", async ({ setTitle, setOutput }) => {
            setTitle("Redeeming product");
            await runEveryUntil(async () => {
              const body: PandabuyExchangeRequest = {
                exchangeCode: redeemCode,
                way:
                  way === "points"
                    ? PandabuyExchangeWay.POINTS
                    : PandabuyExchangeWay.BALANCE,
              };
              try {
                await fetchPandabuy("/gateway/mall/ep/exchange/submit", {
                  body,
                  method: "POST",
                  token: config.pandabuyToken,
                });
                return true;
              } catch (e) {
                if (!(e instanceof HttpError)) {
                  throw e;
                }
                if (
                  e.code === 500 &&
                  e.message.includes("redeemed by another user")
                ) {
                  throw new Error("Product already redeemed");
                }
                setOutput(`Invalid HTTP status: ${e.code} (${e.message})`);
                return false;
              }
            }, delay * 1_000);
            setTitle("Redeemed product");
          }),
        ]);
      });
    }),
  );
};

const runEveryUntil = <T>(
  func: () => Promise<T>,
  every: number,
  isDone?: (value: T) => boolean,
) => {
  return new Promise<T>((resolve, reject) => {
    let done: boolean;
    let value: T;
    const callback = async () => {
      let result: T;
      try {
        result = await func();
      } catch (e) {
        reject(e);
        throw e;
      }
      if (done) return;
      if (isDone ? isDone(result) : !!result) {
        done = true;
        value = result;
        clearInterval(timer);
        resolve(value);
      }
    };
    const timer = setInterval(callback, every);
    setImmediate(callback);
  });
};
