import React, { useState } from 'react';
import { healthApi } from '../services/healthApi';
import { MedicationItem } from '../types/health';
import { Pill, Clock, Calendar, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';

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
      }, 700);
    } catch (err: any) {
      console.error('Failed to add medication', err);
      setError(err.response?.data?.message || 'Failed to add medication.');
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
        form="add-medication-form"
        onClick={handleSubmit}
        disabled={loading}
        className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
          </>
        ) : (
          'Save Medication'
        )}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Medication"
      subtitle="Track prescriptions and active schedules"
      icon={
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
          <Pill className="w-5 h-5" />
        </div>
      }
      footer={footer}
      maxWidth="md"
    >
      <form id="add-medication-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs text-red-700 bg-red-50 rounded-xl border border-red-200 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-xs text-green-700 bg-green-50 rounded-xl border border-green-200 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dosage</label>
            <input
              type="text"
              required
              placeholder="e.g. 500mg, 10ml"
              value={formData.dosage || ''}
              onChange={e => setFormData({ ...formData, dosage: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Frequency</label>
            <select
              value={formData.frequency || 'Once daily'}
              onChange={e => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Three times daily">Three times daily</option>
              <option value="As needed">As needed (SOS)</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" /> Timing / Schedule
          </label>
          <input
            type="text"
            placeholder="e.g. Morning after breakfast, Before bed"
            value={formData.timeOfDay || ''}
            onChange={e => setFormData({ ...formData, timeOfDay: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Start Date
            </label>
            <input
              type="date"
              value={formData.startDate || ''}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> End Date (Optional)
            </label>
            <input
              type="date"
              value={formData.endDate || ''}
              onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" /> Instructions / Notes
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Take with food, avoid alcohol, drink plenty of water"
            value={formData.instructions || ''}
            onChange={e => setFormData({ ...formData, instructions: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};
