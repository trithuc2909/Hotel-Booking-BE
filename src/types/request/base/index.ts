import { Request } from "express";

// Authenticated User Info (JWT token)
export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Base Authenticated Request - Tất cả request có auth sẽ extend từ đây
export interface AuthenticatedRequest<
  TParams = any,
  TBody = any,
  TQuery = any,
> extends Request<TParams, any, TBody, TQuery> {
  user: AuthenticatedUser;
}

// Auth Request Shortcuts
export type AuthOnlyRequest = AuthenticatedRequest<any, any, any>;
export type AuthWithParams<TParams> = AuthenticatedRequest<TParams, any, any>;
export type AuthWithQuery<TQuery> = AuthenticatedRequest<any, any, TQuery>;
export type AuthWithBody<TBody> = AuthenticatedRequest<any, TBody, any>;
export type AuthWithParamsAndBody<TParams, TBody> = AuthenticatedRequest<
  TParams,
  TBody,
  any
>;

// Non-Auth Request Shortcuts
export type BodyRequest<T> = Request<any, any, T>;
export type QueryRequest<T> = Request<any, any, any, T>;
export type ParamsRequest<T> = Request<T>;
export type FullRequest<TParams, TBody, TQuery> = Request<
  TParams,
  any,
  TBody,
  TQuery
>;

// Base List Request (Pagination, Sorting, Searching, Filtering)
export interface BaseListRequest {
  pageNum?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
  searchBy?: string;
  status?: string;
  startDateFrom?: string;
  startDateTo?: string;
}
