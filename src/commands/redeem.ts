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
  restock: boolean;
  restockDelay: number;
}

export const redeem = async (
  productIds: string[],
  { way, delay, restock, restockDelay }: RedeemOptions,
) => {
  const config = await loadConfig();
  validateToken(config);

  await Promise.allSettled(
    productIds.map((productId) => {
      return task(productId, async ({ task }) => {
        let redeemCode = "";

        return task.group((task) => [
          task("Retrieving product code", async ({ setOutput, setTitle }) => {
            redeemCode = await runEveryUntil(async ({ setDelay }) => {
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
                  if (restock) {
                    setDelay(restockDelay * 1_000);
                    setOutput("Product already redeemed, waiting for restock");
                    break;
                  } else {
                    throw new Error("Product already redeemed");
                  }
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
            await runEveryUntil(async ({ setDelay }) => {
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
                  if (!restock) {
                    throw new Error("Product already redeemed");
                  }
                  setDelay(restockDelay * 1_000);
                  setOutput("Product already redeemed, waiting for restock");
                } else {
                  setOutput(`Invalid HTTP status: ${e.code} (${e.message})`);
                }
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

interface RunEveryUntilControls {
  setDelay: (every: number) => void;
}

const runEveryUntil = <T>(
  func: (controls: RunEveryUntilControls) => Promise<T>,
  every: number,
  isDone?: (value: T) => boolean,
) => {
  return new Promise<T>((resolve, reject) => {
    let done: boolean;
    let value: T;
    let timer: Timer;
    let delay = every;

    const setDelay = (every: number) => {
      if (delay === every) return;
      delay = every;
      clearInterval(timer);
      timer = setInterval(callback, every);
    };

    const callback = async () => {
      let result: T;
      try {
        result = await func({ setDelay });
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

    timer = setInterval(callback, every);
    setImmediate(callback);
  });
};
