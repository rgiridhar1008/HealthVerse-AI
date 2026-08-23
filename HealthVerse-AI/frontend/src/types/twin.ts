export interface TwinMetrics {
  weightTrend: { date: string; weight: number; bmi: number }[];
  activitySleepTrend: { date: string; activity: number; sleep: number }[];
  nutritionAdherence: number; // percentage 0-100
  medicationAdherence: number; // percentage 0-100
  overallWellnessScore: number; // percentage 0-100
  status: 'optimal' | 'improving' | 'needs_attention';
}
