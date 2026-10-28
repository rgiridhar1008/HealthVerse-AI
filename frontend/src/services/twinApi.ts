import api from './api';
import { TwinMetrics } from '../types/twin';

export const twinApi = {
  getTwinMetrics: async (): Promise<TwinMetrics> => {
    const response = await api.get<TwinMetrics>('/api/health-twin/status');
    return response.data;
  },

  getTwinStatus: async (): Promise<TwinMetrics> => {
    const response = await api.get<TwinMetrics>('/api/health-twin/status');
    return response.data;
  },

  getComprehensiveTwin: async (): Promise<any> => {
    const response = await api.get<any>('/api/health-twin/comprehensive');
    return response.data;
  }
};