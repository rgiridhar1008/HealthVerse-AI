export interface SymptomPayload {
  symptoms: string;
  duration?: string;
  severity?: 'Mild' | 'Moderate' | 'Severe';
  age?: number;
  weight?: number;
  height?: number;
  allergies?: string[];
  chronic_conditions?: string[];
}

export interface SymptomAnalysisResponse {
  insights: string;
  recommendations: string[];
  seekProfessionalCare: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface ChatPayload {
  message: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  disclaimer?: string;
}
