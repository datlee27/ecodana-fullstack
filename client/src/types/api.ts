export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  data?: unknown;
  timestamp?: string;
}
