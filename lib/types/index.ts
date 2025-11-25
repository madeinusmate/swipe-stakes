/**
 * Type Exports
 *
 * Central export file for all TypeScript types used in the Myriad Starter Kit.
 * Import from '@/lib/types' for convenient access to all types.
 */

// Market types
export type {
  MarketState,
  Outcome,
  OutcomePriceCharts,
  PricePoint,
  MarketFees,
  Market,
  MarketSummary,
  MarketAction,
  MarketEvent,
  OutcomeHolder,
  OutcomeHolders,
} from "./market";

// Portfolio types
export type {
  PositionStatus,
  Position,
  PositionWithMarket,
  ClaimStatus,
  PortfolioSummary,
} from "./portfolio";

// Trade types
export type {
  TradeAction,
  ClaimAction,
  QuoteRequest,
  Quote,
  QuoteFees,
  ClaimRequest,
  ClaimResponse,
  TransactionStatus,
  TradeTransaction,
} from "./trade";

// API types
export type {
  Pagination,
  PaginatedResponse,
  MarketsQueryParams,
  MarketsResponse,
  MarketResponse,
  MarketEventsQueryParams,
  MarketEventsResponse,
  MarketHoldersQueryParams,
  MarketHoldersResponse,
  UserEventsQueryParams,
  UserEventsResponse,
  PortfolioQueryParams,
  PortfolioResponse,
  Question,
  QuestionsQueryParams,
  QuestionsResponse,
  ApiError,
} from "./api";

