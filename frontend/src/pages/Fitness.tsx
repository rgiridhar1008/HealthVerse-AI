import React, { useEffect, useState } from 'react';
import { wellnessApi } from '../services/wellnessApi';
import { FitnessPlan } from '../types/wellness';
import { Activity, Dumbbell, Timer, Loader2, Sparkles, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import FitnessPreferencesModal from '../components/FitnessPreferencesModal';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const Fitness = () => {
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await wellnessApi.getFitnessPlan();
      setPlan(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load fitness plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesSaved = async () => {
    setIsPreferencesOpen(false);
    setIsGenerating(true);
    try {
      await wellnessApi.generateFitnessPlan();
      await fetchPlan();
    } catch (error) {
      console.error('Failed to regenerate plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  if (isLoading || isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-primary-100 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="w-16 h-16 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center relative z-10">
            <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
          </div>
        </div>
        <p className="text-slate-500 text-sm font-medium animate-pulse">
          {isGenerating ? 'Generating your personalized plan with local AI...' : 'Analyzing Fitness Profile...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="text-red-500 bg-red-50 p-4 rounded-full">
          <Activity className="h-8 w-8" />
        </div>
        <p className="text-slate-700 font-medium">{error}</p>
        <button onClick={fetchPlan} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700">
          Try Again
        </button>
      </div>
    );
  }

  if (!plan) {
    return (
      <motion.div 
        initial="hidden"
        animate="show"
        variants={container}
        className="max-w-6xl mx-auto space-y-8 pb-12"
      >
        <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Dumbbell className="h-8 w-8 text-indigo-500" />
              </div>
              Personalized Fitness
            </h1>
            <p className="text-slate-500 mt-2">AI-generated workout plan tailored to your physical capabilities and goals.</p>
          </div>
          
          <button 
            onClick={() => setIsPreferencesOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            <Zap className="w-5 h-5" />
            Personalize Plan
          </button>
        </motion.div>
        
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
          <Dumbbell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">No plan yet</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">You haven't generated a personalized fitness plan. Click 'Personalize Plan' to generate a plan tailored to your profile.</p>
          <button onClick={() => setIsPreferencesOpen(true)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors">
            Generate Plan
          </button>
        </div>
        
        <FitnessPreferencesModal 
          isOpen={isPreferencesOpen}
          onClose={() => setIsPreferencesOpen(false)}
          onSaved={handlePreferencesSaved}
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      <motion.div variants={item} className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Dumbbell className="h-8 w-8 text-blue-500" />
            </div>
            Personalized Fitness
          </h1>
          <p className="text-slate-500 mt-2">AI-adaptive weekly activity schedule tailored to your biometrics and goals.</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity className="w-32 h-32" />
        </div>
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <Sparkles className="h-5 w-5 text-blue-200" />
          <h3 className="font-semibold text-blue-100 tracking-wide uppercase text-sm">AI Fitness Insight</h3>
        </div>
        <div className="relative z-10 max-w-2xl">
          <p className="text-lg font-medium leading-snug">
            {plan.weeklyPlan.length === 0
              ? "Your fitness plan is empty. Click 'Modify Preferences' to generate a plan tailored to your profile."
              : "Based on your preferences and profile, this weekly schedule is optimized for your goals. Remember to listen to your body and rest when needed."}
          </p>
        </div>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex items-center gap-6 hover:shadow-md transition-shadow group">
          <div className="h-20 w-20 rounded-2xl bg-teal-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Activity className="h-10 w-10 text-teal-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Step Goal</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900">{plan.dailyStepGoal.toLocaleString()}</span>
              <span className="text-sm font-medium text-slate-500">steps</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full w-fit">
              <Zap className="w-4 h-4" /> Recommended for recovery
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex items-center gap-6 hover:shadow-md transition-shadow group">
          <div className="h-20 w-20 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Timer className="h-10 w-10 text-purple-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Target Duration</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900">{plan.workoutDuration}</span>
              <span className="text-sm font-medium text-slate-500">minutes / day</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full w-fit">
              <Timer className="w-4 h-4" /> Optimal for your schedule
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dumbbell className="h-6 w-6 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">Adaptive Weekly Schedule</h2>
          </div>
          <button 
            onClick={() => setIsPreferencesOpen(true)}
            className="text-sm font-bold text-primary-600 flex items-center hover:text-primary-700 transition-colors"
          >
            Modify Preferences <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
        
        <div className="divide-y divide-slate-100 p-2">
          {plan.weeklyPlan.map((dayPlan, idx) => {
            const isRest = dayPlan.activity === 'Rest';
            return (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (idx * 0.05) }}
                key={idx} 
                className="p-4 mx-2 my-1 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-default"
              >
                <div className="flex items-center gap-6 w-full">
                  <div className="w-28 flex-shrink-0">
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">{dayPlan.day}</span>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isRest ? 'bg-slate-100' : 'bg-primary-50 text-primary-600'}`}>
                      {isRest ? <Activity className="w-5 h-5 text-slate-400" /> : <Dumbbell className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isRest ? 'text-slate-500' : 'text-slate-800'}`}>{dayPlan.activity}</p>
                      {!isRest && <p className="text-xs text-slate-500 mt-0.5">Target: {plan.workoutDuration} mins</p>}
                    </div>
                  </div>

                  <div className="shrink-0 hidden md:block">
                    {isRest ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                        Recovery Day
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700 ring-1 ring-primary-200">
                        Active Training
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <FitnessPreferencesModal 
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        onSaved={handlePreferencesSaved}
      />
    </motion.div>
  );
};

export default Fitness;
