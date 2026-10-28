import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, Loader2, Utensils, Info } from 'lucide-react';
import { healthApi } from '../services/healthApi';
import { HealthProfile } from '../types/health';

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
  
  // Local state for the preferences we care about
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
      setDietaryPreference(data.dietaryPreference || '');
      setAllergies(data.allergies || '');
      setFitnessGoal(data.fitnessGoal || '');
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 text-center sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 transition-opacity bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative inline-block w-full max-w-lg p-6 overflow-hidden text-left align-bottom transition-all transform bg-white shadow-2xl rounded-2xl sm:my-8 sm:align-middle"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-500" />
              Nutrition Preferences
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 transition-colors hover:text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
            <div className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Dietary Preference
                </label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value as HealthProfile['dietaryPreference'])}
                  className="w-full px-4 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select...</option>
                  <option value="None">None</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Keto">Keto</option>
                  <option value="Paleo">Paleo</option>
                  <option value="Mediterranean">Mediterranean</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Allergies / Intolerances
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g., Peanuts, Dairy, Gluten (comma separated)"
                  className="w-full px-4 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
                <p className="mt-1 text-xs text-slate-500">Leave blank if none.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Primary Nutrition Goal
                </label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value as HealthProfile['fitnessGoal'])}
                  className="w-full px-4 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select Goal...</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Endurance">Endurance</option>
                </select>
              </div>

              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100 mt-2">
                <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800">
                  Saving will regenerate your personalized nutrition plan using our local AI. 
                  This may take a few moments.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-orange-200"
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
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NutritionPreferencesModal;
