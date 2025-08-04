// API Response interface for consistent frontend consumption
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}
