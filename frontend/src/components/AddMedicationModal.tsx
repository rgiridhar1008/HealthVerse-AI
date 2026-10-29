import React, { useState } from 'react';
import { healthApi } from '../services/healthApi';
import { MedicationItem } from '../types/health';
import { X, Pill, Clock, Calendar, FileText, Loader2, CheckCircle2 } from 'lucide-react';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<MedicationItem>>({
    name: '',
    dosage: '500mg',
    frequency: 'Once daily',
    timeOfDay: 'Morning after breakfast',
    startDate: new Date().toISOString().split('T')[0],
    instructions: 'Take with water',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('Medication name is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await healthApi.addMedication(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Failed to add medication', err);
      setError(err.response?.data?.message || 'Failed to add medication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add Medication</h2>
              <p className="text-xs text-slate-500">Track prescriptions and active schedules</p>
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
              Medication saved to Digital Health Twin!
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Medication Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Metformin, Atorvastatin"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dosage</label>
              <input
                type="text"
                placeholder="e.g. 500mg, 1 tablet"
                value={formData.dosage || ''}
                onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Frequency</label>
              <input
                type="text"
                placeholder="e.g. Once daily, Twice daily"
                value={formData.frequency || ''}
                onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Schedule / Timing
            </label>
            <input
              type="text"
              placeholder="e.g. Morning after breakfast, Bedtime"
              value={formData.timeOfDay || ''}
              onChange={e => setFormData({ ...formData, timeOfDay: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Instructions / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Take with a full glass of water"
              value={formData.instructions || ''}
              onChange={e => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
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
              className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                'Add Medication'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

