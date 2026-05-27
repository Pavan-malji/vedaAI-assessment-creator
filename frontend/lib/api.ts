import axios from 'axios';
import { AssignmentConfig, CreateAssignmentResponse, GetResultResponse } from './types';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create a new assignment and kick off AI generation
 */
export const createAssignment = async (
  config: AssignmentConfig
): Promise<CreateAssignmentResponse> => {
  const response = await apiClient.post<CreateAssignmentResponse>(
    '/api/assignments',
    config
  );
  return response.data;
};

/**
 * Get assignment metadata by ID
 */
export const getAssignment = async (id: string) => {
  const response = await apiClient.get(`/api/assignments/${id}`);
  return response.data;
};

/**
 * Get the generated question paper result for an assignment
 * Returns { source, paper } on success or { status } while pending
 */
export const getResult = async (id: string): Promise<GetResultResponse> => {
  const response = await apiClient.get<GetResultResponse>(
    `/api/assignments/${id}/result`
  );
  return response.data;
};
