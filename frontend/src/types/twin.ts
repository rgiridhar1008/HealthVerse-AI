export interface TwinMetrics {
  weightTrend: { date: string; weight: number; bmi: number }[];
  activitySleepTrend: { date: string; activity: number; sleep: number }[];
  nutritionAdherence: number; // percentage 0-100
  medicationAdherence: number; // percentage 0-100
  overallWellnessScore: number; // percentage 0-100
  status: 'optimal' | 'improving' | 'needs_attention' | 'insufficient data' | string;
  radarData: { subject: string; A: number; fullMark: number }[];
  journeyEvents: { date: string; event: string; type: 'positive' | 'warning' | 'info' | 'success' | string }[];
  
  // AI Generated Insights
  weightTrendString: string;
  activityTrendString: string;
  sleepTrendString: string;
  energyScore: number;
  recoveryScore: number;
  insights: string[];
  recommendations: string[];
}

export interface ComprehensiveTwin {
  profile: {
    name: string;
    age: number | null;
    gender: string | null;
    email: string;
  };
  healthProfile: {
    height: number;
    weight: number;
    bmi: number;
    lifestyle: string;
    goals: string;
    allergies: string;
    conditions: string;
    dietaryPreference: string;
    sleepPattern: string;
  } | null;
  completeness: {
    totalCategories: number;
    filledCategories: number;
    available: string[];
    missing: string[];
  };
  vitals: any[];
  medicalReports: any[];
  symptoms: any[];
  medications: any[];
  nutrition: any | null;
  fitness: any | null;
  wellness: any | null;
  timeline: { date: string; event: string; type: string }[];
  insights: string[];
}
