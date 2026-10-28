import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, Loader2, Heart, Info } from 'lucide-react';
import { healthApi } from '../services/healthApi';
import { HealthProfile } from '../types/health';

interface WellnessPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId: string;
}

const WellnessPreferencesModal: React.FC<WellnessPreferencesModalProps> = ({ 
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
  const [lifestyle, setLifestyle] = useState<HealthProfile['lifestyle']>('');
  const [chronicConditions, setChronicConditions] = useState('');
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
      setLifestyle(data.lifestyle || '');
      setChronicConditions(data.chronicConditions || '');
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
        lifestyle,
        chronicConditions,
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
              <Heart className="w-5 h-5 text-indigo-500" />
              Wellness Preferences
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
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm font-medium text-slate-500">Loading preferences...</p>
            </div>
          ) : (
            <div className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Daily Lifestyle / Stress Level
                </label>
                <select
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value as HealthProfile['lifestyle'])}
                  className="w-full px-4 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select...</option>
                  <option value="Sedentary">Sedentary</option>
                  <option value="Lightly Active">Lightly Active</option>
                  <option value="Moderately Active">Moderately Active</option>
                  <option value="Very Active">Very Active</option>
                  <option value="Super Active">Super Active</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Wellness Goals
                </label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value as HealthProfile['fitnessGoal'])}
                  className="w-full px-4 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select Goal...</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Endurance">Endurance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Chronic Conditions or Limitations
                </label>
                <input
                  type="text"
                  value={chronicConditions}
                  onChange={(e) => setChronicConditions(e.target.value)}
                  placeholder="e.g., Asthma, Insomnia, None"
                  className="w-full px-4 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100 mt-2">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-800">
                  Saving will regenerate your personalized wellness plan using our local AI. 
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
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
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

export default WellnessPreferencesModal;
