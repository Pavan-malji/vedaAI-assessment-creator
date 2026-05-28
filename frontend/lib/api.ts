import axios from 'axios';
import { AssignmentConfig, CreateAssignmentResponse, GetResultResponse } from './types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiBaseUrl) {
  throw new Error('NEXT_PUBLIC_API_URL must be set to the deployed backend URL.');
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Simple auth helpers
export const apiRegister = async (name: string, email: string, password: string) => {
  const resp = await apiClient.post('/api/auth/register', { name, email, password });
  return resp.data;
};

export const apiLogin = async (email: string, password: string) => {
  const resp = await apiClient.post('/api/auth/login', { email, password });
  return resp.data;
};

export const apiLogout = async () => {
  const resp = await apiClient.post('/api/auth/logout');
  return resp.data;
};

export const apiGetMe = async () => {
  const resp = await apiClient.get('/api/auth/me');
  return resp.data;
};

export const apiRefresh = async () => {
  const resp = await apiClient.post('/api/auth/refresh');
  return resp.data;
};

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
