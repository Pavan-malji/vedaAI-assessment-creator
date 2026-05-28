import axios from 'axios';
import { AssignmentConfig, CreateAssignmentResponse, GetResultResponse } from './types';

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const ensureApiBaseUrl = () => {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL must be set to the deployed backend URL.');
  }

  return apiBaseUrl;
};

// Simple auth helpers
export const apiRegister = async (name: string, email: string, password: string) => {
  ensureApiBaseUrl();
  const resp = await apiClient.post('/api/auth/register', { name, email, password });
  return resp.data;
};

export const apiLogin = async (email: string, password: string) => {
  ensureApiBaseUrl();
  const resp = await apiClient.post('/api/auth/login', { email, password });
  return resp.data;
};

export const apiLogout = async () => {
  ensureApiBaseUrl();
  const resp = await apiClient.post('/api/auth/logout');
  return resp.data;
};

export const apiGetMe = async () => {
  ensureApiBaseUrl();
  const resp = await apiClient.get('/api/auth/me');
  return resp.data;
};

export const apiRefresh = async () => {
  ensureApiBaseUrl();
  const resp = await apiClient.post('/api/auth/refresh');
  return resp.data;
};

/**
 * Create a new assignment and kick off AI generation
 */
export const createAssignment = async (
  config: AssignmentConfig
): Promise<CreateAssignmentResponse> => {
  ensureApiBaseUrl();
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
  ensureApiBaseUrl();
  const response = await apiClient.get(`/api/assignments/${id}`);
  return response.data;
};

/**
 * Get the generated question paper result for an assignment
 * Returns { source, paper } on success or { status } while pending
 */
export const getResult = async (id: string): Promise<GetResultResponse> => {
  ensureApiBaseUrl();
  const response = await apiClient.get<GetResultResponse>(
    `/api/assignments/${id}/result`
  );
  return response.data;
};
