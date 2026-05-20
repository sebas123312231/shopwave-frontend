export interface ApiResponse<T> {
  message: string;
  status: boolean;
  data?: T;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}