export enum CNFairProductStatus {
  REDEEMABLE = 1,
  REDEEMED = 2,
  AVAILABLE_SOON = 10,
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
