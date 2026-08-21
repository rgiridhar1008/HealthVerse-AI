import api from './api';
import { NutritionPlan, FitnessPlan, WellnessPlan } from '../types/wellness';

const USE_MOCK = true;
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const wellnessApi = {
  getNutritionPlan: async (): Promise<NutritionPlan> => {
    if (USE_MOCK) {
      await delay(1000);
      return {
        dailyCaloriesTarget: 2200,
        proteinTarget: 120,
        waterTarget: 2.5,
        meals: {
          breakfast: ['Oatmeal with berries', '2 boiled eggs', 'Green tea'],
          lunch: ['Grilled chicken salad', 'Quinoa', 'Olive oil dressing'],
          dinner: ['Baked salmon', 'Steamed broccoli', 'Sweet potato'],
          snacks: ['Greek yogurt', 'Almonds', 'Apple'],
        }
      };
    }
    const response = await api.get<NutritionPlan>('/api/wellness/nutrition');
    return response.data;
  },

  getFitnessPlan: async (): Promise<FitnessPlan> => {
    if (USE_MOCK) {
      await delay(1000);
      return {
        dailyStepGoal: 10000,
        workoutDuration: 45,
        weeklyPlan: [
          { day: 'Monday', activity: '30m Jogging + 15m Core' },
          { day: 'Tuesday', activity: '45m Weight Training (Upper Body)' },
          { day: 'Wednesday', activity: 'Active Recovery / Yoga' },
          { day: 'Thursday', activity: '45m Weight Training (Lower Body)' },
          { day: 'Friday', activity: 'HIIT Cardio' },
          { day: 'Saturday', activity: 'Long Walk / Hiking' },
          { day: 'Sunday', activity: 'Rest' },
        ]
      };
    }
    const response = await api.get<FitnessPlan>('/api/wellness/fitness');
    return response.data;
  },

  getWellnessPlan: async (): Promise<WellnessPlan> => {
    if (USE_MOCK) {
      await delay(1000);
      return {
        sleepGoal: 8,
        currentStressLevel: 'Moderate',
        recommendations: [
          'Maintain a consistent sleep schedule by going to bed at the same time.',
          'Limit screen time 1 hour before sleeping.',
          'Practice gratitude journaling in the morning.'
        ],
        breathingExercises: [
          '4-7-8 Breathing Technique: Inhale for 4s, hold for 7s, exhale for 8s.',
          'Box Breathing: Inhale 4s, hold 4s, exhale 4s, hold 4s.'
        ]
      };
    }
    const response = await api.get<WellnessPlan>('/api/wellness/plan');
    return response.data;
  }
};
