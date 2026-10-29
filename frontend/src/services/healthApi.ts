import api from './api';
import { HealthProfile, DailyHealthData, DailyHealthDataPayload, MedicationItem } from '../types/health';

export const healthApi = {
  getProfile: async (userId?: string): Promise<HealthProfile> => {
    const url = userId ? `/api/health/profile/${userId}` : '/api/health/profile';
    const response = await api.get<any>(url);
    const data = response.data;
    return {
      age: data.age || 0,
      gender: data.gender || '',
      height: data.height || 0,
      weight: data.weight || 0,
      lifestyle: data.lifestyle || '',
      fitnessGoal: data.goals || '',
      allergies: data.allergies || '',
      chronicConditions: data.conditions || '',
      bloodGroup: data.bloodGroup || '',
      currentMedications: data.currentMedications || '',
      sleepPattern: data.sleepPattern || '',
      dietaryPreference: data.dietaryPreference || ''
    };
  },

  updateProfile: async (profile: HealthProfile): Promise<HealthProfile> => {
    const payload = {
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      lifestyle: profile.lifestyle,
      goals: profile.fitnessGoal,
      allergies: profile.allergies,
      conditions: profile.chronicConditions,
      dietaryPreference: profile.dietaryPreference,
      sleepPattern: profile.sleepPattern,
      bloodGroup: profile.bloodGroup,
      currentMedications: profile.currentMedications
    };
    const response = await api.put<any>('/api/health/profile', payload);
    const data = response.data;
    return {
      age: data.age,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      lifestyle: data.lifestyle,
      fitnessGoal: data.goals,
      allergies: data.allergies,
      chronicConditions: data.conditions,
      dietaryPreference: data.dietaryPreference,
      sleepPattern: data.sleepPattern,
      bloodGroup: data.bloodGroup || profile.bloodGroup || '',
      currentMedications: data.currentMedications || profile.currentMedications || ''
    };
  },

  // Daily Health Data
  logDailyData: async (payload: DailyHealthDataPayload): Promise<DailyHealthData> => {
    const response = await api.post<DailyHealthData>('/api/health/daily', payload);
    return response.data;
  },

  getDailyDataToday: async (): Promise<DailyHealthData> => {
    const response = await api.get<DailyHealthData>('/api/health/daily');
    return response.data;
  },

  getDailyDataHistory: async (): Promise<DailyHealthData[]> => {
    const response = await api.get<DailyHealthData[]>('/api/health/daily/history');
    return response.data;
  },

  // Medications
  getMedications: async (activeOnly: boolean = false): Promise<MedicationItem[]> => {
    const response = await api.get<MedicationItem[]>(`/api/health/medications?activeOnly=${activeOnly}`);
    return response.data;
  },

  addMedication: async (medication: Partial<MedicationItem>): Promise<MedicationItem> => {
    const response = await api.post<MedicationItem>('/api/health/medications', medication);
    return response.data;
  },

  deleteMedication: async (id: number): Promise<void> => {
    await api.delete(`/api/health/medications/${id}`);
  }
};
