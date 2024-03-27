export enum CNFairProductStatus {
  AVAILABLE_SOON = 0,
  REDEEMABLE = 1,
  REDEEMED = 2,
}

export interface CNFairResponse<T> {
  msg: string;
  code: number;
  data: T;
}

export interface CNFairDetails {
  points: number;
  exchangeCode: string;
  status: CNFairProductStatus;
}
