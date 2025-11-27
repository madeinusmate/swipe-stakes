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
  PriceDataPoint,
  PriceChartTimeframe,
  OutcomePriceCharts,
  MarketFees,
  Market,
  MarketSummary,
  MarketAction,
  MarketEvent,
} from "./market";

// Portfolio types
export type {
  PositionStatus,
  Position,
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
} from "./trade";

// API types
export type {
  Pagination,
  MarketsQueryParams,
  MarketsResponse,
  MarketResponse,
  UserEventsQueryParams,
  UserEventsResponse,
  PortfolioQueryParams,
  PortfolioResponse,
  ApiError,
} from "./api";

