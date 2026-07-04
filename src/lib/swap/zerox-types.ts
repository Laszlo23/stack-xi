export type ZeroXAllowanceIssue = {
  spender?: string;
  actual?: string;
  required?: string;
};

export type ZeroXQuoteIssues = {
  allowance?: ZeroXAllowanceIssue;
};

export type ZeroXTransaction = {
  to: `0x${string}`;
  data: `0x${string}`;
  value?: string;
  gas?: string;
};

export type ZeroXPriceResponse = {
  buyAmount: string;
  sellAmount: string;
  minBuyAmount?: string;
  issues?: ZeroXQuoteIssues;
  allowanceTarget?: string;
};

export type ZeroXQuoteResponse = ZeroXPriceResponse & {
  transaction: ZeroXTransaction;
};

export type ZeroXPriceParams = {
  sellToken: `0x${string}`;
  buyToken: `0x${string}`;
  sellAmount: string;
  taker: `0x${string}`;
  slippageBps?: number;
};

export type ZeroXQuoteParams = ZeroXPriceParams;
