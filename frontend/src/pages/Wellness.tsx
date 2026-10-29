import React, { useEffect, useState } from 'react';
import { wellnessApi } from '../services/wellnessApi';
import { WellnessPlan as WellnessPlanType } from '../types/wellness';
import { Moon, Heart, Wind, Loader2, Sparkles, CheckCircle2, ChevronRight, Sunrise, Settings, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import BreathingExerciseModal from '../components/BreathingExerciseModal';
import WellnessPreferencesModal from '../components/WellnessPreferencesModal';
import { useAuth } from '../hooks/useAuth';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const Wellness = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [insight, setInsight] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeExercise, setActiveExercise] = useState<{ title: string; description: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPlanAndInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [planData, insightData] = await Promise.all([
        wellnessApi.getWellnessPlan(),
        wellnessApi.getPredictiveInsights()
      ]);
      setPlan(planData);
      setInsight(insightData);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load wellness plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesSaved = async () => {
    setIsModalOpen(false);
    setIsGenerating(true);
    try {
      await wellnessApi.generateWellnessPlan();
      await fetchPlanAndInsights();
    } catch (error) {
      console.error('Failed to regenerate plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchPlanAndInsights();
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
          {isGenerating ? 'Generating your personalized plan with local AI...' : 'Analyzing Wellness Patterns...'}
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
        <button onClick={fetchPlanAndInsights} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700">
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
              <div className="p-2 bg-rose-50 rounded-xl">
                <Heart className="h-8 w-8 text-rose-500" />
              </div>
              Mental Wellness
            </h1>
            <p className="text-slate-500 mt-2">AI-driven insights for stress management, sleep quality, and mindfulness.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            <Settings className="w-5 h-5" />
            Personalize Plan
          </button>
        </motion.div>
        
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">No plan yet</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">You haven't generated a personalized wellness plan. Click 'Personalize Plan' to generate a plan tailored to your profile.</p>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 shadow-sm transition-colors">
            Generate Plan
          </button>
        </div>
        
        <WellnessPreferencesModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={handlePreferencesSaved}
          userId={user?.id || ''}
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
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Moon className="h-8 w-8 text-indigo-500" />
            </div>
            Wellness Intelligence
          </h1>
          <p className="text-slate-500 mt-2">Predictive insights and holistic recommendations for a balanced mind and body.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 font-semibold rounded-xl transition-colors whitespace-nowrap"
        >
          <Settings className="w-5 h-5" />
          Personalize Wellness
        </button>
      </motion.div>

      {insight && (
        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-900">Predictive Wellness Insight</h2>
              </div>
              <p className="text-sm text-slate-500">Based on your recent historical health records</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Area</span>
                <span className="text-sm font-semibold text-indigo-900">{insight.area}</span>
              </div>
              <div className="w-px h-8 bg-indigo-200"></div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Trend</span>
                <span className="text-sm font-semibold text-indigo-900">{insight.trend}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Why? (Reasoning)</h3>
                <p className="text-slate-800 leading-relaxed font-medium">{insight.reason}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Recommendation</h3>
                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl border border-indigo-100">
                  <p className="font-semibold">{insight.recommendation}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Based On (Evidence)</h3>
                <ul className="space-y-2">
                  {insight.evidence?.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                  {(!insight.evidence || insight.evidence.length === 0) && (
                    <span className="text-sm text-slate-400 italic">Insufficient historical data points.</span>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Contributing Factors</h3>
                <div className="flex flex-wrap gap-2">
                  {insight.contributing_factors?.map((factor: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
                      {factor}
                    </span>
                  ))}
                  {(!insight.contributing_factors || insight.contributing_factors.length === 0) && (
                    <span className="text-sm text-slate-400 italic">N/A</span>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span>Confidence Level</span>
                  <span className="text-slate-700">{insight.confidence}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
            <p className="text-xs text-slate-500">Note: This is an AI-generated wellness insight, not a medical diagnosis.</p>
          </div>
        </motion.div>
      )}

      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex items-center gap-6 hover:shadow-md transition-shadow group">
          <div className="h-20 w-20 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Moon className="h-10 w-10 text-indigo-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nightly Sleep Goal</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900">{plan.sleepGoal}</span>
              <span className="text-sm font-medium text-slate-500">hours</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit">
              <Sunrise className="w-4 h-4" /> Based on your circadian rhythm
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex items-center gap-6 hover:shadow-md transition-shadow group">
          <div className="h-20 w-20 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Heart className="h-10 w-10 text-rose-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Stress Level</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 capitalize">{plan.currentStressLevel}</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full w-fit">
              <Heart className="w-4 h-4" /> Detected from biometrics
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900">Sleep Recommendations</h2>
            </div>
          </div>
          <div className="p-6 flex-1">
            <ul className="space-y-4">
              {plan.recommendations.map((rec: string, idx: number) => (
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.1) }}
                  key={idx} 
                  className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <div className="p-1 bg-indigo-50 rounded-full shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 leading-relaxed pt-0.5">{rec}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wind className="h-5 w-5 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-900">Breathing Exercises</h2>
            </div>
          </div>
          <div className="p-6 flex-1 space-y-4">
            {plan.breathingExercises.map((ex: string, idx: number) => {
              const [title, desc] = ex.split(': ');
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + (idx * 0.1) }}
                  key={idx} 
                  className="bg-teal-50 border border-teal-100 p-5 rounded-xl hover:shadow-md transition-shadow"
                >
                  <h3 className="text-base font-bold text-teal-900 mb-2 flex items-center gap-2">
                    <Wind className="w-4 h-4" /> {title}
                  </h3>
                  <p className="text-sm font-medium text-teal-800 leading-relaxed">{desc}</p>
                  <button 
                    onClick={() => setActiveExercise({ title, description: desc })}
                    className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Start Exercise
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <BreathingExerciseModal 
        isOpen={!!activeExercise}
        onClose={() => setActiveExercise(null)}
        title={activeExercise?.title || ''}
        description={activeExercise?.description || ''}
      />
      
      {user && (
        <WellnessPreferencesModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={handlePreferencesSaved}
          userId={user.id}
        />
      )}
    </motion.div>
  );
};

export default Wellness;
