import React, { useEffect, useState } from 'react';
import { wellnessApi } from '../services/wellnessApi';
import { NutritionPlan } from '../types/wellness';
import { Apple, Droplets, Flame, Utensils, Loader2, Sparkles, CheckCircle2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import NutritionPreferencesModal from '../components/NutritionPreferencesModal';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const Nutrition = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await wellnessApi.getNutritionPlan();
      setPlan(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load nutrition plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesSaved = async () => {
    setIsModalOpen(false);
    setIsGenerating(true);
    try {
      await wellnessApi.generateNutritionPlan();
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
          {isGenerating ? 'Generating your personalized plan with local AI...' : 'Analyzing Nutrition Profile...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="text-red-500 bg-red-50 p-4 rounded-full">
          <Apple className="h-8 w-8" />
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
              <div className="p-2 bg-orange-50 rounded-xl">
                <Apple className="h-8 w-8 text-orange-500" />
              </div>
              Personalized Nutrition
            </h1>
            <p className="text-slate-500 mt-2">AI-generated dietary targets based on your unique health twin profile.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            <Settings className="w-5 h-5" />
            Personalize Plan
          </button>
        </motion.div>
        
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-12">
          <Utensils className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">No plan yet</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">You haven't generated a personalized nutrition plan. Click 'Personalize Plan' to generate a plan tailored to your profile.</p>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 shadow-sm transition-colors">
            Generate Plan
          </button>
        </div>
        
        <NutritionPreferencesModal 
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
            <div className="p-2 bg-orange-50 rounded-xl">
              <Apple className="h-8 w-8 text-orange-500" />
            </div>
            Personalized Nutrition
          </h1>
          <p className="text-slate-500 mt-2">AI-generated dietary targets based on your unique health twin profile.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 font-semibold rounded-xl transition-colors whitespace-nowrap"
        >
          <Settings className="w-5 h-5" />
          Personalize Plan
        </button>
      </motion.div>

      <motion.div variants={item} className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Utensils className="w-24 h-24" />
        </div>
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <Sparkles className="h-5 w-5 text-orange-200" />
          <h3 className="font-semibold text-orange-100 tracking-wide uppercase text-sm">AI Nutrition Insight</h3>
        </div>
        <div className="relative z-10 max-w-2xl">
          <p className="text-lg font-medium leading-snug">
            {plan.dailyCaloriesTarget === 0 
              ? "Your nutrition plan is empty. Click 'Personalize Plan' to generate a plan tailored to your profile." 
              : "Based on your preferences, this plan provides balanced macronutrients to support your wellness goals. Ensure you stay hydrated throughout the day."}
          </p>
        </div>
      </motion.div>

      {/* Targets */}
      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex items-center gap-5 hover:shadow-md transition-shadow group">
          <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Calories</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{plan.dailyCaloriesTarget}</span>
              <span className="text-sm font-medium text-slate-500">kcal</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex items-center gap-5 hover:shadow-md transition-shadow group">
          <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Apple className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Protein</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{plan.proteinTarget}</span>
              <span className="text-sm font-medium text-slate-500">g</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex items-center gap-5 hover:shadow-md transition-shadow group">
          <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Droplets className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Hydration</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{plan.waterTarget}</span>
              <span className="text-sm font-medium text-slate-500">L</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Meals */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <Utensils className="h-6 w-6 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900">Today's Recommended Meals</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x divide-slate-100">
          {Object.entries(plan.meals).map(([mealName, items], idx) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1) }}
              key={mealName} 
              className="p-8 hover:bg-slate-50 transition-colors"
            >
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                {mealName.charAt(0).toUpperCase() + mealName.slice(1)}
              </h3>
              <ul className="space-y-4">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-700 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {user && (
        <NutritionPreferencesModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={handlePreferencesSaved}
          userId={user.id}
        />
      )}
    </motion.div>
  );
};

export default Nutrition;
