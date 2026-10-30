import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2, Heart, Info } from 'lucide-react';
import { healthApi } from '../services/healthApi';
import { HealthProfile } from '../types/health';
import Modal from './Modal';

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
  
  // Local state for the preferences
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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        form="wellness-preferences-form"
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
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
      title="Wellness Preferences"
      subtitle="Calibrate mental equilibrium, recovery rhythms, and lifestyle strain"
      icon={
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
          <Heart className="w-5 h-5" />
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
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading preferences...</p>
        </div>
      ) : (
        <form id="wellness-preferences-form" onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Current Lifestyle & Daily Strain
            </label>
            <select
              value={lifestyle || ''}
              onChange={(e) => setLifestyle(e.target.value as HealthProfile['lifestyle'])}
              className="w-full px-4 py-2.5 text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Select Lifestyle...</option>
              <option value="Sedentary">Sedentary (Low physical movement, desk job)</option>
              <option value="Moderately Active">Moderately Active (Regular walking, active routine)</option>
              <option value="Very Active">Very Active (High physical exertion / intense workouts)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Primary Wellness & Balance Goal
            </label>
            <select
              value={fitnessGoal || ''}
              onChange={(e) => setFitnessGoal(e.target.value as HealthProfile['fitnessGoal'])}
              className="w-full px-4 py-2.5 text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Select Goal...</option>
              <option value="Stress Reduction">Stress Reduction & Mental Equilibrium</option>
              <option value="Better Sleep">Deep Restorative Sleep Architecture</option>
              <option value="Energy & Focus">Sustained Daily Energy & Cognitive Focus</option>
              <option value="Maintenance">Holistic Wellness Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Health Sensitivities / Chronic Conditions
            </label>
            <input
              type="text"
              value={chronicConditions}
              onChange={(e) => setChronicConditions(e.target.value)}
              placeholder="e.g. Migraine, Anxiety, Hypertension, None"
              className="w-full px-4 py-2.5 text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            <p className="mt-1 text-xs text-slate-500">Provide any conditions you would like the wellness guide to accommodate.</p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-800 leading-relaxed">
              Saving will regenerate your personalized wellness plan using AI. Your sleep targets, nervous system recovery exercises, and stress insights will adapt.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default WellnessPreferencesModal;
