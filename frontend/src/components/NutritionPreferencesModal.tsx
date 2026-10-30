import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2, Utensils, Info } from 'lucide-react';
import { healthApi } from '../services/healthApi';
import { HealthProfile } from '../types/health';
import Modal from './Modal';

interface NutritionPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId: string;
}

const NutritionPreferencesModal: React.FC<NutritionPreferencesModalProps> = ({ 
  isOpen, 
  onClose, 
  onSaved,
  userId
}) => {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Local state for the preferences
  const [dietaryPreference, setDietaryPreference] = useState<HealthProfile['dietaryPreference']>('');
  const [allergies, setAllergies] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState<HealthProfile['fitnessGoal']>('');

  useEffect(() => {
    if (isOpen && userId) {
      loadProfile();
    }
  }, [isOpen, userId]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await healthApi.getProfile(userId);
      setProfile(data);
      setDietaryPreference(data.dietaryPreference || 'None');
      setAllergies(data.allergies || '');
      setFitnessGoal(data.fitnessGoal || 'Maintenance');
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    setError('');
    
    try {
      const updatedProfile: HealthProfile = {
        ...profile,
        dietaryPreference,
        allergies,
        fitnessGoal
      };
      
      await healthApi.updateProfile(updatedProfile);
      onSaved();
      onClose();
    } catch (err) {
      setError('Failed to save preferences.');
      setSaving(false);
    }
  };

  const footer = !loading ? (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={saving}
        className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="nutrition-preferences-form"
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-orange-200"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving & Generating...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save & Regenerate
          </>
        )}
      </button>
    </>
  ) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nutrition Preferences"
      subtitle="Tailor your daily dietary profile and culinary choices"
      icon={
        <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
          <Utensils className="w-5 h-5" />
        </div>
      }
      footer={footer}
      maxWidth="lg"
    >
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 text-sm font-medium text-red-600 bg-red-50 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading preferences...</p>
        </div>
      ) : (
        <form id="nutrition-preferences-form" onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Dietary Preference & Cuisine
            </label>
            <select
              value={dietaryPreference || 'None'}
              onChange={(e) => setDietaryPreference(e.target.value as HealthProfile['dietaryPreference'])}
              className="w-full px-4 py-2.5 text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            >
              <option value="None">Standard Balanced Diet</option>
              <option value="Vegetarian">Indian Vegetarian (Lacto-Vegetarian / Dal, Sabzi, Paneer)</option>
              <option value="Non-Vegetarian">Indian Non-Vegetarian (Chicken, Fish, Eggs, Mutton)</option>
              <option value="South Indian Vegetarian">South Indian Vegetarian (Idli, Dosa, Sambar, Rasam, Curd Rice)</option>
              <option value="North Indian Vegetarian">North Indian Vegetarian (Roti, Dal Tadka, Rajma, Chana, Paneer)</option>
              <option value="Eggetarian">Eggetarian (Vegetarian + Eggs)</option>
              <option value="Vegan">Vegan (100% Plant-Based)</option>
              <option value="Keto">Keto / Low-Carb</option>
              <option value="Mediterranean">Mediterranean / Heart Healthy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Allergies / Dietary Exclusions
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Peanuts, Dairy, Gluten, Mustard, Shellfish"
              className="w-full px-4 py-2.5 text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
            <p className="mt-1 text-xs text-slate-500">Leave blank if you have no dietary restrictions.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Primary Nutrition Goal
            </label>
            <select
              value={fitnessGoal || 'Maintenance'}
              onChange={(e) => setFitnessGoal(e.target.value as HealthProfile['fitnessGoal'])}
              className="w-full px-4 py-2.5 text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            >
              <option value="Weight Loss">Weight Loss (Caloric Deficit)</option>
              <option value="Maintenance">Maintenance (Balanced Energy)</option>
              <option value="Muscle Gain">Muscle Gain (High Protein Hypertrophy)</option>
              <option value="Endurance">Endurance & Athletic Energy</option>
            </select>
          </div>

          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-800 leading-relaxed">
              Saving will regenerate your personalized nutrition plan using AI. Your meal recommendations, calorie targets, and macronutrient balance will adapt to your preferences.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default NutritionPreferencesModal;
