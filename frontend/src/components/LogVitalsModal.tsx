import React, { useState, useEffect } from 'react';
import {
  Activity,
  Moon,
  Footprints,
  Droplet,
  Dumbbell,
  Smile,
  Loader2,
  CheckCircle2,
  Scale
} from 'lucide-react';
import { healthApi } from '../services/healthApi';
import { DailyHealthDataPayload } from '../types/health';
import Modal from './Modal';

interface LogVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogged?: () => void;
  onSuccess?: () => void;
  initialWeight?: number;
}

export const LogVitalsModal: React.FC<LogVitalsModalProps> = ({
  isOpen,
  onClose,
  onLogged,
  onSuccess,
  initialWeight = 70.0
}) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<DailyHealthDataPayload>({
    date: getTodayDate(),
    weight: initialWeight,
    sleepHours: 7.5,
    steps: 6000,
    waterIntake: 2.0,
    exerciseMinutes: 30,
    mood: 'Good',
  });

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      // Attempt to pre-fetch today's data if already logged
      healthApi.getDailyDataToday()
        .then(existing => {
          if (existing) {
            setFormData({
              date: existing.date || getTodayDate(),
              weight: existing.weight || initialWeight,
              sleepHours: existing.sleepHours || 7.5,
              steps: existing.steps || 6000,
              waterIntake: existing.waterIntake || 2.0,
              exerciseMinutes: existing.exerciseMinutes || 30,
              mood: existing.mood || 'Good',
            });
          }
        })
        .catch(() => {
          // No prior log for today; fallback to default
        });
    }
  }, [isOpen, initialWeight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await healthApi.logDailyData(formData);
      setSuccess(true);
      setTimeout(() => {
        if (onLogged) onLogged();
        if (onSuccess) onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Failed to log daily vitals', err);
      setError(err.response?.data?.message || 'Failed to save health vitals. Please check values.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition focus:outline-none"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="log-vitals-form"
        onClick={handleSubmit}
        disabled={loading}
        className="px-6 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
          </>
        ) : (
          'Save Health Vitals'
        )}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Daily Vitals"
      subtitle="Update your health biometric tracking metrics"
      icon={
        <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
          <Activity className="w-5 h-5" />
        </div>
      }
      footer={footer}
      maxWidth="lg"
    >
      <form id="log-vitals-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-xs text-green-700 bg-green-50 rounded-xl border border-green-200 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            Vitals logged successfully! Updating Digital Health Twin...
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-blue-500" /> Body Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              required
              value={formData.weight || ''}
              onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="e.g. 70.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sleep Hours */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              required
              value={formData.sleepHours || ''}
              onChange={e => setFormData({ ...formData, sleepHours: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="e.g. 8.0"
            />
          </div>

          {/* Steps */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-emerald-500" /> Daily Steps
            </label>
            <input
              type="number"
              step="100"
              min="0"
              max="100000"
              required
              value={formData.steps || ''}
              onChange={e => setFormData({ ...formData, steps: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="e.g. 8000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Water Intake */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-cyan-500" /> Hydration (Liters)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              required
              value={formData.waterIntake || ''}
              onChange={e => setFormData({ ...formData, waterIntake: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="e.g. 2.5"
            />
          </div>

          {/* Exercise Minutes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-orange-500" /> Workout (Mins)
            </label>
            <input
              type="number"
              step="5"
              min="0"
              max="360"
              required
              value={formData.exerciseMinutes || ''}
              onChange={e => setFormData({ ...formData, exerciseMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="e.g. 45"
            />
          </div>
        </div>

        {/* Mood */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-amber-500" /> Daily Mood / Feeling
          </label>
          <select
            value={formData.mood || 'Good'}
            onChange={e => setFormData({ ...formData, mood: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
          >
            <option value="Excellent">Excellent - High Energy & Focus</option>
            <option value="Good">Good - Well Rested</option>
            <option value="Okay">Okay - Normal Routine</option>
            <option value="Tired">Tired - Low Energy</option>
            <option value="Stressed">Stressed - High Workload</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};
