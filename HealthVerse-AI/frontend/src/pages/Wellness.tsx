import React, { useEffect, useState } from 'react';
import { wellnessApi } from '../services/wellnessApi';
import { WellnessPlan as WellnessPlanType } from '../types/wellness';
import { Moon, Heart, Wind, Loader2, Sparkles, CheckCircle2, ChevronRight, Sunrise } from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const Wellness = () => {
  const [plan, setPlan] = useState<WellnessPlanType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await wellnessApi.getWellnessPlan();
        setPlan(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-primary-100 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="w-16 h-16 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center relative z-10">
            <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
          </div>
        </div>
        <p className="text-slate-500 text-sm font-medium animate-pulse">Analyzing Wellness Patterns...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Failed to load wellness plan.</p>
      </div>
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
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Moon className="h-8 w-8 text-indigo-500" />
            </div>
            Mental & Sleep Wellness
          </h1>
          <p className="text-slate-500 mt-2">Holistic recommendations for a balanced mind, managed stress, and rested body.</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="bg-gradient-to-br from-indigo-500 to-indigo-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Moon className="w-32 h-32" />
        </div>
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <Sparkles className="h-5 w-5 text-indigo-200" />
          <h3 className="font-semibold text-indigo-100 tracking-wide uppercase text-sm">AI Wellness Insight</h3>
        </div>
        <div className="relative z-10 max-w-2xl">
          <p className="text-lg font-medium leading-snug">
            Your stress levels peak in the late afternoon. Implementing a 5-minute Box Breathing session at 3 PM will help lower your cortisol before the evening.
          </p>
        </div>
      </motion.div>

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
              {plan.recommendations.map((rec, idx) => (
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
            {plan.breathingExercises.map((ex, idx) => {
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
                  <button className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                    Start Exercise
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Wellness;
