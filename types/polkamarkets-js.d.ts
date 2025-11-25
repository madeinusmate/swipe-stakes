/**
 * Type declarations for polkamarkets-js
 *
 * This library doesn't ship with TypeScript types.
 * Add more specific types as needed based on usage.
 */
declare module "polkamarkets-js" {
  export class Application {
    constructor(options: { web3Provider: any; web3EventsProvider?: string });
    getPredictionMarketV3PlusContract(options: {
      contractAddress: string;
      querierContractAddress: string;
    }): PredictionMarketContract;
    getERC20Contract(options: { contractAddress: string }): ERC20Contract;
  }

  export interface PredictionMarketContract {
    buy(params: {
      marketId: string | number;
      outcomeId: string | number;
      amount: string | number;
      minShares: string | number;
      referral?: string;
    }): Promise<any>;
    sell(params: {
      marketId: string | number;
      outcomeId: string | number;
      amount: string | number;
      maxShares: string | number;
    }): Promise<any>;
    claimWinnings(params: { marketId: string | number }): Promise<any>;
    claimVoided(params: { marketId: string | number }): Promise<any>;
  }

  export interface ERC20Contract {
    approve(params: {
      spenderAddress: string;
      amount: string | number;
    }): Promise<any>;
    allowance(params: {
      ownerAddress: string;
      spenderAddress: string;
    }): Promise<string>;
    balanceOf(address: string): Promise<string>;
  }
}

