export type PandabuyResponse<T = void> = T & {
  code: number;
  msg: string;
};

export enum PandabuyExchangeWay {
  POINTS = 1,
  BALANCE = 2,
}

export interface PandabuyExchangeRequest {
  way: PandabuyExchangeWay;
  exchangeCode: string;
}
