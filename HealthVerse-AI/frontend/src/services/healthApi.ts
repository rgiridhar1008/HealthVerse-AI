import api from './api';
import { HealthProfile } from '../types/health';

const USE_MOCK = true;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockProfile: HealthProfile = {
  age: 30,
  gender: 'Male',
  height: 175,
  weight: 72,
  bloodGroup: 'O+',
  allergies: 'None',
  chronicConditions: 'None',
  currentMedications: 'Vitamin D3',
  lifestyle: 'Moderately Active',
  fitnessGoal: 'Maintenance',
  sleepPattern: '7-9 hours',
  dietaryPreference: 'None',
};

export const healthApi = {
  getProfile: async (): Promise<HealthProfile> => {
    if (USE_MOCK) {
      await delay(600);
      return { ...mockProfile };
    }
    const response = await api.get<HealthProfile>('/api/user/profile');
    return response.data;
  },

  updateProfile: async (profile: HealthProfile): Promise<HealthProfile> => {
    if (USE_MOCK) {
      await delay(800);
      mockProfile = { ...profile };
      return { ...mockProfile };
    }
    const response = await api.put<HealthProfile>('/api/user/profile', profile);
    return response.data;
  }
};
