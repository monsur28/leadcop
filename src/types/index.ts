export type ActionResponse<T = unknown> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string; fieldErrors?: Record<string, string[]> };

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
