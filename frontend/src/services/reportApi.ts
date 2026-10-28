import api from './api';
import { ReportAnalysis } from '../types/report';

export const reportApi = {
  uploadReport: async (file: File, onProgress?: (progress: number) => void): Promise<{ id: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportType', 'GENERAL_BLOOD_TEST');
    formData.append('reportDate', new Date().toISOString().split('T')[0]);
    formData.append('description', 'User uploaded report via UI');
    
    const response = await api.post<{ id: string }>('/api/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    return response.data;
  },

  getAnalysis: async (id: string): Promise<ReportAnalysis> => {
    // We must POST to trigger the analysis, since upload only stores the file
    const response = await api.post<ReportAnalysis>(`/api/analysis/reports/${id}/analyze`);
    return response.data;
  },

  checkAnalysisStatus: async (reportId: string): Promise<ReportAnalysis> => {
    const response = await api.get<ReportAnalysis>(`/api/analysis/reports/${reportId}`);
    return response.data;
  },

  getAllReports: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/api/reports');
    return response.data;
  }
};
