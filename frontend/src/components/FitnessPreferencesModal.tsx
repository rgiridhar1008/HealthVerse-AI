import React, { useState, useEffect } from 'react';
import { Save, Loader2, AlertCircle, Dumbbell } from 'lucide-react';
import { healthApi } from '../services/healthApi';
import { HealthProfile as HealthProfileType, defaultHealthProfile } from '../types/health';
import { useAuth } from '../hooks/useAuth';
import Modal from './Modal';

interface FitnessPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const FitnessPreferencesModal: React.FC<FitnessPreferencesModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HealthProfileType>(defaultHealthProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isOpen || !user) return;
      setIsLoading(true);
      setErrorMsg('');
      try {
        const data = await healthApi.getProfile(user.id);
        setProfile(data);
      } catch (err) {
        setErrorMsg('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [isOpen, user]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSaving(true);
    
    try {
      await healthApi.updateProfile(profile);
      onSaved();
      onClose();
    } catch (err) {
      setErrorMsg('Failed to update preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const footer = !isLoading ? (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isSaving}
        className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="fitness-preferences-form"
        onClick={handleSubmit}
        disabled={isSaving}
        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        ) : (
          <><Save className="w-4 h-4" /> Save Preferences</>
        )}
      </button>
    </>
  ) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fitness Preferences"
      subtitle="Update your goals and lifestyle to adapt your plan."
      icon={
        <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
          <Dumbbell className="w-5 h-5" />
        </div>
      }
      footer={footer}
      maxWidth="lg"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading preferences...</p>
        </div>
      ) : (
        <form id="fitness-preferences-form" onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm">{errorMsg}</span>
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Fitness Goal</label>
              <p className="text-xs text-slate-500 mb-2">What is your primary objective?</p>
              <select 
                name="fitnessGoal" 
                value={profile.fitnessGoal || ''} 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-slate-800 shadow-sm transition-all outline-none"
              >
                <option value="" disabled>Select Goal</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Endurance">Endurance / Stamina</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Lifestyle / Activity Level</label>
              <p className="text-xs text-slate-500 mb-2">How active are you on a daily basis?</p>
              <select 
                name="lifestyle" 
                value={profile.lifestyle || ''} 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-slate-800 shadow-sm transition-all outline-none"
              >
                <option value="" disabled>Select Activity Level</option>
                <option value="Sedentary">Sedentary (Little to no exercise)</option>
                <option value="Lightly Active">Lightly Active (Light exercise 1-3 days/week)</option>
                <option value="Moderately Active">Moderately Active (Moderate exercise 3-5 days/week)</option>
                <option value="Very Active">Very Active (Hard exercise 6-7 days/week)</option>
                <option value="Super Active">Super Active (Very hard exercise & physical job)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Average Sleep Pattern</label>
              <p className="text-xs text-slate-500 mb-2">How much do you typically sleep?</p>
              <select 
                name="sleepPattern" 
                value={profile.sleepPattern || ''} 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-slate-800 shadow-sm transition-all outline-none"
              >
                <option value="" disabled>Select Sleep Pattern</option>
                <option value="Less than 5 hours">Less than 5 hours</option>
                <option value="5-7 hours">5-7 hours</option>
                <option value="7-9 hours">7-9 hours</option>
                <option value="More than 9 hours">More than 9 hours</option>
              </select>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default FitnessPreferencesModal;
