import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterQuery {
  status?: string;
  type?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ErrorDetails {
  field?: string;
  message: string;
  code?: string;
}

export interface ValidationError {
  error: string;
  details: ErrorDetails[];
}

export interface SuccessResponse<T = any> extends ApiResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse extends ApiResponse {
  success: false;
  error: string;
  details?: ErrorDetails[];
}