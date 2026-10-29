import React, { useState } from 'react';
import { healthApi } from '../services/healthApi';
import { DailyHealthDataPayload } from '../types/health';
import { X, Activity, Moon, Droplets, Scale, Smile, Flame, Loader2, CheckCircle2 } from 'lucide-react';

interface LogVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LogVitalsModal: React.FC<LogVitalsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<DailyHealthDataPayload>({
    date: todayStr,
    weight: 70,
    sleepHours: 7.5,
    steps: 7500,
    waterIntake: 2.2,
    exerciseMinutes: 30,
    mood: 'Good'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await healthApi.logDailyData({
        date: formData.date,
        weight: formData.weight ? Number(formData.weight) : undefined,
        sleepHours: formData.sleepHours ? Number(formData.sleepHours) : undefined,
        steps: formData.steps ? Number(formData.steps) : undefined,
        waterIntake: formData.waterIntake ? Number(formData.waterIntake) : undefined,
        exerciseMinutes: formData.exerciseMinutes ? Number(formData.exerciseMinutes) : undefined,
        mood: formData.mood
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 900);
    } catch (err: any) {
      console.error('Failed to log daily vitals', err);
      setError(err.response?.data?.message || 'Failed to save health vitals. Please check values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Log Daily Vitals</h2>
              <p className="text-xs text-slate-500">Update your health biometric tracking metrics</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-xs text-green-700 bg-green-50 rounded-xl border border-green-200 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Vitals logged successfully! Updating Digital Health Twin...
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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
                <Scale className="w-3.5 h-3.5 text-slate-400" /> Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                required
                value={formData.weight || ''}
                onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            {/* Steps */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blue-500" /> Steps Count
              </label>
              <input
                type="number"
                min="0"
                max="100000"
                required
                value={formData.steps || ''}
                onChange={e => setFormData({ ...formData, steps: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            {/* Sleep Hours */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-purple-500" /> Sleep (Hours)
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
              />
            </div>

            {/* Water Intake */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-500" /> Water (Liters)
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
              />
            </div>

            {/* Exercise Minutes */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" /> Exercise (Mins)
              </label>
              <input
                type="number"
                min="0"
                max="360"
                required
                value={formData.exerciseMinutes || ''}
                onChange={e => setFormData({ ...formData, exerciseMinutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
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

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Health Vitals'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
