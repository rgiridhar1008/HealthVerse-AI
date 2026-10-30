import React, { useEffect, useState } from 'react';
import { twinApi } from '../services/twinApi';
import { ComprehensiveTwin } from '../types/twin';
import { motion } from 'framer-motion';
import { 
  Accessibility, Loader2, Activity, Pill, Apple, ShieldCheck, AlertCircle,
  BrainCircuit, Heart, Zap, Sparkles, History, FileText, ClipboardList, Plus
} from 'lucide-react';
import { AddMedicationModal } from '../components/AddMedicationModal';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const DigitalHealthTwin = () => {
  const [twin, setTwin] = useState<ComprehensiveTwin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);

  const fetchTwinData = async () => {
    try {
      const data = await twinApi.getComprehensiveTwin();
      setTwin(data);
    } catch (err: any) {
      console.error('Failed to fetch comprehensive twin data:', err);
      setError(err.response?.data?.message || 'Failed to connect to the Digital Twin service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTwinData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error || !twin) {
    return (
      <div className="text-center py-12 flex flex-col items-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Service Unavailable</h3>
        <p className="text-slate-500 max-w-md mx-auto">{error || 'Failed to load Digital Health Twin data. Please try again later.'}</p>
      </div>
    );
  }

  const completenessPercentage = Math.round((twin.completeness.filledCategories / twin.completeness.totalCategories) * 100);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="max-w-7xl mx-auto space-y-6 pb-12"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-xl">
              <Accessibility className="h-8 w-8 text-primary-600" />
            </div>
            Digital Health Twin
          </h1>
          <p className="text-slate-500 mt-2">
            A comprehensive, real-time representation of your entire health data ecosystem.
          </p>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-200 flex flex-col items-end gap-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data Completeness</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary-600">
              {completenessPercentage}
            </span>
            <span className="text-sm font-medium text-slate-500">%</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-1">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Accessibility className="w-5 h-5 text-primary-500"/> Profile & Demographics</h2>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Name</span> <span className="font-medium">{twin.profile.name}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Age</span> <span className="font-medium">{twin.profile.age || 'Not provided'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Gender</span> <span className="font-medium">{twin.profile.gender || 'Not provided'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Height</span> <span className="font-medium">{twin.healthProfile?.height ? `${twin.healthProfile.height} cm` : 'Not provided'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Weight</span> <span className="font-medium">{twin.healthProfile?.weight ? `${twin.healthProfile.weight} kg` : 'Not provided'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">BMI</span> <span className="font-medium">{twin.healthProfile?.bmi || 'Not provided'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Allergies</span> <span className="font-medium truncate max-w-[150px]">{twin.healthProfile?.allergies || 'None recorded'}</span></div>
            </div>
        </motion.div>

        <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary-500"/> Medical Data (Real)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><ClipboardList className="w-4 h-4"/> Medical Reports ({twin.medicalReports.length})</h3>
                    {twin.medicalReports.length > 0 ? (
                        <ul className="text-sm space-y-2 max-h-32 overflow-y-auto">
                            {twin.medicalReports.map((r, i) => (
                                <li key={i} className="flex justify-between text-slate-600">
                                    <span className="truncate pr-2">{r.fileName || r.reportType}</span>
                                    <span className="text-xs shrink-0">{new Date(r.reportDate || r.uploadDate).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-slate-400 italic">No data recorded.</p>}
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2"><Pill className="w-4 h-4"/> Medications ({twin.medications.length})</h3>
                        <button 
                            onClick={() => setIsMedModalOpen(true)}
                            className="px-2 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg flex items-center gap-1 transition"
                        >
                            <Plus className="w-3 h-3" /> Add
                        </button>
                    </div>
                    {twin.medications.length > 0 ? (
                        <ul className="text-sm space-y-2 max-h-32 overflow-y-auto">
                            {twin.medications.map((m, i) => (
                                <li key={i} className="flex justify-between items-center text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-100">
                                    <div className="truncate pr-2">
                                        <p className="font-semibold text-slate-800 text-xs">{m.name}</p>
                                        <p className="text-[10px] text-slate-400">{m.frequency || m.timeOfDay || 'Active'}</p>
                                    </div>
                                    <span className="text-xs shrink-0 font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{m.dosage || 'Active'}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-slate-400 italic">No medications recorded.</p>}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><Heart className="w-4 h-4"/> Symptoms ({twin.symptoms.length})</h3>
                    {twin.symptoms.length > 0 ? (
                        <ul className="text-sm space-y-2 max-h-32 overflow-y-auto">
                            {twin.symptoms.map((s, i) => (
                                <li key={i} className="flex justify-between text-slate-600">
                                    <span className="truncate pr-2">{s.symptoms}</span>
                                    <span className="text-xs shrink-0">{s.severity}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-slate-400 italic">No data recorded.</p>}
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><Activity className="w-4 h-4"/> Daily Vitals ({twin.vitals.length} logs)</h3>
                    {twin.vitals.length > 0 ? (
                        <ul className="text-sm space-y-2 max-h-32 overflow-y-auto">
                            {twin.vitals.slice(0, 3).map((v, i) => (
                                <li key={i} className="flex justify-between text-slate-600">
                                    <span className="truncate pr-2">Wt: {v.weight}kg, Slp: {v.sleepHours}h</span>
                                    <span className="text-xs shrink-0">{new Date(v.date).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-sm text-slate-400 italic">No data recorded.</p>}
                </div>
            </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nutrition Card */}
        <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                <Apple className="w-4 h-4 text-orange-500"/> Nutrition
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                twin.nutrition ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {twin.nutrition ? 'AI Plan Active' : twin.healthProfile?.dietaryPreference ? 'Profile Preferences' : 'Not Configured'}
              </span>
            </div>

            {twin.nutrition || twin.healthProfile ? (
              <div className="text-sm text-slate-600 space-y-2.5">
                <p>
                  <strong className="text-slate-800">Dietary Pattern:</strong>{' '}
                  <span className="text-slate-700 font-medium">{twin.nutrition?.dietType || twin.healthProfile?.dietaryPreference || 'Standard Balanced'}</span>
                </p>
                <p>
                  <strong className="text-slate-800">Daily Target:</strong>{' '}
                  <span className="text-slate-700 font-medium">
                    {twin.nutrition?.dailyCalories 
                      ? `${twin.nutrition.dailyCalories} kcal (${twin.nutrition.proteinGrams || 0}g protein)` 
                      : (twin.healthProfile?.goals ? `${twin.healthProfile.goals} (Goal)` : 'Calculate in Nutrition')}
                  </span>
                </p>
                <p>
                  <strong className="text-slate-800">Allergies:</strong>{' '}
                  <span className="text-slate-700 font-medium">{twin.nutrition?.allergyRestrictions || twin.healthProfile?.allergies || 'None recorded'}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No nutrition profile or plan recorded yet.</p>
            )}
          </div>
        </motion.div>

        {/* Fitness Card */}
        <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500"/> Fitness
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                twin.fitness ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {twin.fitness ? 'AI Plan Active' : twin.healthProfile?.lifestyle ? 'Profile Preferences' : 'Not Configured'}
              </span>
            </div>

            {twin.fitness || twin.healthProfile ? (
              <div className="text-sm text-slate-600 space-y-2.5">
                <p>
                  <strong className="text-slate-800">Primary Goal:</strong>{' '}
                  <span className="text-slate-700 font-medium">{twin.fitness?.goal || twin.healthProfile?.goals || 'General Fitness'}</span>
                </p>
                <p>
                  <strong className="text-slate-800">Frequency & Focus:</strong>{' '}
                  <span className="text-slate-700 font-medium">
                    {twin.fitness?.weeklyFrequency 
                      ? `${twin.fitness.weeklyFrequency} days/wk (${twin.fitness.sessionDurationMinutes || 45} mins)` 
                      : (twin.healthProfile?.lifestyle || 'Moderate Conditioning')}
                  </span>
                </p>
                <p>
                  <strong className="text-slate-800">Conditioning Level:</strong>{' '}
                  <span className="text-slate-700 font-medium">{twin.fitness?.fitnessLevel || twin.healthProfile?.lifestyle || 'Beginner / Moderate'}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No fitness profile or plan recorded yet.</p>
            )}
          </div>
        </motion.div>

        {/* Wellness Card */}
        <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-500"/> Wellness
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                twin.wellness ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {twin.wellness ? 'AI Plan Active' : twin.healthProfile?.sleepPattern ? 'Profile Preferences' : 'Not Configured'}
              </span>
            </div>

            {twin.wellness || twin.healthProfile ? (
              <div className="text-sm text-slate-600 space-y-2.5">
                <p>
                  <strong className="text-slate-800">Wellness Goal:</strong>{' '}
                  <span className="text-slate-700 font-medium">{twin.wellness?.goal || twin.healthProfile?.goals || 'Restorative Balance & Recovery'}</span>
                </p>
                <p>
                  <strong className="text-slate-800">Mindfulness Practice:</strong>{' '}
                  <span className="text-slate-700 font-medium">
                    {twin.wellness?.title || (twin.wellness?.dailyMinutes ? `${twin.wellness.dailyMinutes} mins daily practice` : 'Box Breathing & Sleep Hygiene')}
                  </span>
                </p>
                <p>
                  <strong className="text-slate-800">Sleep Pattern:</strong>{' '}
                  <span className="text-slate-700 font-medium">{twin.healthProfile?.sleepPattern || '7-8 hours (Target)'}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No wellness profile or plan recorded yet.</p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Health Journey Timeline</h3>
        </div>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {twin.timeline.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              <p className="text-sm font-medium">No health journey events yet.</p>
              <p className="text-xs mt-1">Upload reports or generate plans to build history.</p>
            </div>
          )}
          {twin.timeline.map((event, idx) => {
            let Icon = Sparkles;
            let colorClass = 'text-primary-500';
            let bgClass = 'bg-primary-50';
            
            if (event.type === 'report') {
              Icon = FileText;
            } else if (event.type === 'symptom') {
              Icon = AlertCircle;
              colorClass = 'text-warning-500';
              bgClass = 'bg-warning-50';
            }

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + (idx * 0.1) }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${bgClass} shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                  <Icon className={`w-4 h-4 ${colorClass}`} />
                </div>
                
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-slate-800">{event.event}</h4>
                    <span className="text-xs font-medium text-slate-400">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {twin.insights && twin.insights.length > 0 && (
        <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-8">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary-500"/> AI Twin Insights</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
            {twin.insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-green-500">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-4">Your Available Data ({twin.completeness.available.length})</h3>
          <ul className="space-y-3 text-sm">
            {twin.completeness.available.map((cat, i) => (
               <li key={i} className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-500" /> {cat}</li>
            ))}
            {twin.completeness.available.length === 0 && <li className="text-slate-400 italic">None</li>}
          </ul>
        </motion.div>

        <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-amber-500">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-4">Data Not Available Yet ({twin.completeness.missing.length})</h3>
          <ul className="space-y-3 text-sm text-slate-500">
            {twin.completeness.missing.map((cat, i) => (
               <li key={i} className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" /> {cat}</li>
            ))}
            {twin.completeness.missing.length === 0 && <li className="text-slate-400 italic">None</li>}
          </ul>
        </motion.div>
      </div>

      <AddMedicationModal
        isOpen={isMedModalOpen}
        onClose={() => setIsMedModalOpen(false)}
        onSuccess={fetchTwinData}
      />
    </motion.div>
  );
};

export default DigitalHealthTwin;
