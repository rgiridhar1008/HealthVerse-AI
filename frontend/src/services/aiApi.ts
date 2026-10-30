import api from './api';
import {
  SymptomPayload,
  SymptomAnalysisResponse,
  ChatPayload,
  ChatResponse
} from '../types/ai';

export const aiApi = {
  analyzeSymptoms: async (
    payload: SymptomPayload
  ): Promise<SymptomAnalysisResponse> => {
    const response = await api.post<SymptomAnalysisResponse>(
      '/api/analysis/symptoms',
      {
        symptoms: payload.symptoms,
        duration: payload.duration || '',
        severity: payload.severity || 'Mild',
        age: payload.age ?? 25,
        weight: payload.weight ?? 70,
        height: payload.height ?? 175,
        allergies: payload.allergies ?? [],
        chronic_conditions: payload.chronic_conditions ?? []
      },
      { timeout: 180000 } // 180s for Ollama generation
    );

    return response.data;
  },

  chat: async (payload: ChatPayload): Promise<ChatResponse> => {
    const response = await api.post<any>(
      '/api/analysis/chat',
      payload,
      { timeout: 180000 } // 180s for Ollama generation
    );

    return {
      message:
        response.data.response ||
        response.data.message ||
        'No response received',
      disclaimer: response.data.disclaimer
    };
  }
};