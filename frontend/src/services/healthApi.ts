import api from './api';
import { HealthProfile } from '../types/health';

export const healthApi = {
  getProfile: async (userId: string): Promise<HealthProfile> => {
    const response = await api.get<any>(`/api/health/profile/${userId}`);
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
      // Map backend fields
      bloodGroup: '',
      currentMedications: '',
      sleepPattern: data.sleepPattern || '',
      dietaryPreference: data.dietaryPreference || ''
    };
  },

  updateProfile: async (profile: HealthProfile): Promise<HealthProfile> => {
    // Map to backend UpdateHealthProfileRequest contract
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
      sleepPattern: profile.sleepPattern
    };
    const response = await api.put<any>('/api/health/profile', payload);
    const data = response.data;
    return {
      ...profile, // Keep unsupported fields locally
      age: data.age,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      lifestyle: data.lifestyle,
      fitnessGoal: data.goals,
      allergies: data.allergies,
      chronicConditions: data.conditions,
      dietaryPreference: data.dietaryPreference,
      sleepPattern: data.sleepPattern
    };
  }
};
