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
            while (redeemCode === "") {
              let body: CNFairResponse<CNFairDetails> | undefined;
              try {
                body = await fetchCNFair<CNFairDetails>(
                  `gateway/mall/ep/item/detail?itemNo=${productId}`,
                );
              } catch (e) {
                if (!(e instanceof HttpError)) {
                  throw e;
                }
                setOutput(`Invalid HTTP status: ${e.code}`);
              }
              if (body == undefined) continue;
              if (body.data.status === CNFairProductStatus.REDEEMED) {
                throw new Error("Product already redeemed");
              }
              redeemCode = body.data.exchangeCode;
              if (redeemCode === "") {
                await Bun.sleep(delay * 1_000);
              }
            }
            setOutput(redeemCode);
            setTitle("Got product code");
          }),

          task("Waiting for product code", async ({ setTitle, setOutput }) => {
            setTitle("Redeeming product");
            let redeemed = false;
            while (!redeemed) {
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
                redeemed = true;
              } catch (e) {
                if (!(e instanceof HttpError)) {
                  throw e;
                }
                setOutput(`Invalid HTTP status: ${e.code} (${e.message})`);
              }
              if (!redeemed) {
                await Bun.sleep(delay * 1_000);
              }
              setTitle("Redeemed product");
            }
          }),
        ]);
      });
    }),
  );
};
