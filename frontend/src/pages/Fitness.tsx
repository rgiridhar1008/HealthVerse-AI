import React, { useEffect, useState, useRef } from 'react';
import { wellnessApi } from '../services/wellnessApi';
import { healthApi } from '../services/healthApi';
import { FitnessPlan } from '../types/wellness';
import { 
  Activity, Dumbbell, Timer, Loader2, Sparkles, CheckCircle2, 
  ChevronRight, Zap, Play, Pause, RotateCcw, Plus, Flame, Award, 
  Clock, Footprints, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FitnessPreferencesModal from '../components/FitnessPreferencesModal';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

// Exercise generator based on activity name
const getExercisesForActivity = (activity: string): { id: string; name: string; repsOrDuration: string }[] => {
  const lower = activity.toLowerCase();
  if (lower.includes('rest') || lower.includes('recovery')) {
    return [
      { id: 'r1', name: 'Gentle 15-Minute Nature Walk', repsOrDuration: '15 mins' },
      { id: 'r2', name: 'Full-Body Mobility & Hamstring Stretch', repsOrDuration: '10 mins' },
      { id: 'r3', name: 'Diaphragmatic Deep Breathing & Hydration', repsOrDuration: '5 mins' }
    ];
  }
  if (lower.includes('cardio') || lower.includes('hiit') || lower.includes('running')) {
    return [
      { id: 'c1', name: 'Dynamic Joint Warm-up & Arm Circles', repsOrDuration: '5 mins' },
      { id: 'c2', name: 'High Knees & Jumping Jacks Intervals', repsOrDuration: '3 sets x 45s' },
      { id: 'c3', name: 'Brisk Incline Walk / Jogging Pace', repsOrDuration: '20 mins' },
      { id: 'c4', name: 'Mountain Climbers & Plank Hold', repsOrDuration: '3 sets x 30s' },
      { id: 'c5', name: 'Cooldown Quad & Calf Stretch', repsOrDuration: '5 mins' }
    ];
  }
  if (lower.includes('strength') || lower.includes('circuit') || lower.includes('resistance')) {
    return [
      { id: 's1', name: 'Warm-up Bodyweight Squats & Arm Rotations', repsOrDuration: '5 mins' },
      { id: 's2', name: 'Standard Push-ups (or Incline Push-ups)', repsOrDuration: '3 sets x 12 reps' },
      { id: 's3', name: 'Goblet Squats / Walking Lunges', repsOrDuration: '3 sets x 15 reps' },
      { id: 's4', name: 'Dumbbell / Resistance Rows', repsOrDuration: '3 sets x 12 reps' },
      { id: 's5', name: 'Core Plank & Bird-Dog Stability', repsOrDuration: '3 sets x 45s' },
      { id: 's6', name: 'Cooldown Chest & Spine Decompression', repsOrDuration: '5 mins' }
    ];
  }
  // Default balanced regimen
  return [
    { id: 'd1', name: 'Joint Warm-up & Dynamic Stretches', repsOrDuration: '5 mins' },
    { id: 'd2', name: 'Bodyweight Squats & Push-ups Combo', repsOrDuration: '3 sets x 10 reps' },
    { id: 'd3', name: 'Moderate Cardio (Brisk Walk / Cycle)', repsOrDuration: '20 mins' },
    { id: 'd4', name: 'Core Strengthening Plank Hold', repsOrDuration: '3 sets x 30s' },
    { id: 'd5', name: 'Full Body Decompression & Stretch', repsOrDuration: '5 mins' }
  ];
};

const Fitness = () => {
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Feature 1: Selected Day & Checklist
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});

  // Feature 2: Workout Session Timer
  const [timerDuration, setTimerDuration] = useState(45); // default work duration in seconds
  const [restDuration, setRestDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerPhase, setTimerPhase] = useState<'work' | 'rest'>('work');
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Feature 3: Daily Activity Goal Tracker (Steps)
  const [currentSteps, setCurrentSteps] = useState(6500);
  const [stepGoal, setStepGoal] = useState(10000);
  const [isSavingSteps, setIsSavingSteps] = useState(false);

  const fetchPlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await wellnessApi.getFitnessPlan();
      setPlan(data);
      if (data?.dailyStepGoal) {
        setStepGoal(data.dailyStepGoal);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load fitness plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodaySteps = async () => {
    try {
      const dailyData = await healthApi.getDailyDataToday();
      if (dailyData && dailyData.steps != null && dailyData.steps > 0) {
        setCurrentSteps(dailyData.steps);
      }
    } catch (err) {
      // If no daily data logged yet, keep default steps
    }
  };

  useEffect(() => {
    fetchPlan();
    fetchTodaySteps();
  }, []);

  // Timer interval handling
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Switch phase
            if (timerPhase === 'work') {
              setTimerPhase('rest');
              setRoundsCompleted((r) => r + 1);
              return restDuration;
            } else {
              setTimerPhase('work');
              setShowCelebration(true);
              setTimeout(() => setShowCelebration(false), 3000);
              return timerDuration;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerPhase, timerDuration, restDuration]);

  const toggleTimer = () => setIsTimerRunning((prev) => !prev);

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerPhase('work');
    setTimeLeft(timerDuration);
    setRoundsCompleted(0);
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

  // Toggle checklist
  const toggleExerciseCheck = (exerciseId: string) => {
    setCheckedExercises((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const resetChecklist = (exerciseIds: string[]) => {
    setCheckedExercises((prev) => {
      const next = { ...prev };
      exerciseIds.forEach((id) => delete next[id]);
      return next;
    });
  };

  // Quick step adjustment
  const handleAddSteps = async (increment: number) => {
    const updated = Math.max(0, currentSteps + increment);
    setCurrentSteps(updated);
    setIsSavingSteps(true);
    try {
      await healthApi.logDailyData({
        date: new Date().toISOString().split('T')[0],
        steps: updated
      });
    } catch (err) {
      console.warn('Could not persist updated steps:', err);
    } finally {
      setIsSavingSteps(false);
    }
  };

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
          {isGenerating ? 'Generating your personalized fitness plan...' : 'Reviewing fitness profile...'}
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

  // Active workout exercises for selected day
  const activeDay = plan.weeklyPlan[selectedDayIdx] || { day: 'Today', activity: 'General Conditioning' };
  const currentExercises = getExercisesForActivity(activeDay.activity);
  const completedCount = currentExercises.filter((e) => checkedExercises[e.id]).length;
  const progressPercent = Math.round((completedCount / (currentExercises.length || 1)) * 100);

  // Steps goal metrics
  const stepPercent = Math.min(100, Math.round((currentSteps / (stepGoal || 10000)) * 100));
  const estimatedCaloriesBurned = Math.round(currentSteps * 0.04);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Dumbbell className="h-8 w-8 text-blue-500" />
            </div>
            Personalized Fitness
          </h1>
          <p className="text-slate-500 mt-2">AI-adaptive training schedule with live workout tracking, interval timing, and daily goals.</p>
        </div>

        <button 
          onClick={() => setIsPreferencesOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-semibold rounded-xl transition-colors whitespace-nowrap"
        >
          <Zap className="w-5 h-5" />
          Modify Preferences
        </button>
      </motion.div>

      {/* Hero AI Insight Banner */}
      <motion.div variants={item} className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl shadow-sm p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Activity className="w-32 h-32 text-indigo-700" />
        </div>
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-indigo-900 tracking-wider uppercase text-xs">AI Fitness Insight</h3>
        </div>
        <div className="relative z-10 max-w-3xl">
          <p className="text-base font-semibold text-slate-800 leading-relaxed">
            {plan.aiInsight || (plan.weeklyPlan.length === 0
              ? "Your fitness plan is ready. Personalize your schedule anytime."
              : `Focus for ${activeDay.day}: ${activeDay.activity}. Complete the targeted checklist below and pace your interval recovery.`)}
          </p>
        </div>
      </motion.div>

      {/* Top 2 Metric Cards: Step Tracker & Target Duration */}
      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Feature 3: Daily Activity Goal Tracker */}
        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Footprints className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Step Goal</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-black text-slate-900">{currentSteps.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-slate-400">/ {stepGoal.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                <Flame className="w-3 h-3 text-orange-500" /> ~{estimatedCaloriesBurned} kcal
              </span>
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Goal Progress</span>
              <span className="text-teal-600">{stepPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stepPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full"
              />
            </div>
          </div>

          {/* Quick Step Adjustment Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-medium text-slate-500">Log Activity:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddSteps(500)}
                disabled={isSavingSteps}
                className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
              >
                +500
              </button>
              <button
                onClick={() => handleAddSteps(1000)}
                disabled={isSavingSteps}
                className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
              >
                +1,000
              </button>
              <button
                onClick={() => handleAddSteps(2500)}
                disabled={isSavingSteps}
                className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
              >
                +2,500
              </button>
            </div>
          </div>
        </motion.div>

        {/* Target Workout Duration Card */}
        <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Timer className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Session Target</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-black text-slate-900">{plan.workoutDuration}</span>
                  <span className="text-sm font-semibold text-slate-500">minutes / day</span>
                </div>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
              Optimal Schedule
            </span>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Weekly Cadence</span>
              <span className="text-purple-600">
                {plan.weeklyPlan.filter(d => d.activity !== 'Rest').length} Active Days
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {plan.weeklyPlan.map((d, i) => (
                <div 
                  key={i}
                  className={`h-2 rounded-full ${d.activity === 'Rest' ? 'bg-slate-200' : 'bg-purple-500'}`}
                  title={`${d.day}: ${d.activity}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Adaptive Heart-rate pacing</span>
            <span className="font-semibold text-slate-700">Zone 2 - Zone 3 Aerobic</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Feature 2: Workout Session Timer & Interval Training */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Workout Session Interval Timer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Paced interval countdown for sets, HIIT intervals, or timed circuits.</p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Presets:</span>
            {[
              { label: '30s / 15s', work: 30, rest: 15 },
              { label: '45s / 15s', work: 45, rest: 15 },
              { label: '60s / 30s', work: 60, rest: 30 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setTimerDuration(preset.work);
                  setRestDuration(preset.rest);
                  setTimeLeft(preset.work);
                  setTimerPhase('work');
                  setIsTimerRunning(false);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors border ${
                  timerDuration === preset.work && restDuration === preset.rest
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-center">
          {/* Main Countdown Display */}
          <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-8 justify-around bg-slate-50/80 rounded-2xl p-6 border border-slate-100">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  timerPhase === 'work' 
                    ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {timerPhase === 'work' ? '🔥 Work Interval' : '🌿 Rest & Recover'}
                </span>
                <span className="text-xs font-medium text-slate-500">Rounds: {roundsCompleted}</span>
              </div>
              
              <div className="text-6xl font-black text-slate-900 tracking-tight font-mono">
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </div>

              {showCelebration && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1"
                >
                  <Award className="w-4 h-4" /> Round completed! Ready for next work interval!
                </motion.div>
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTimer}
                className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all ${
                  isTimerRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> {timeLeft === timerDuration ? 'Start Timer' : 'Resume'}
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                className="p-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-sm transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Timer Mode Guide */}
          <div className="space-y-3 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 text-xs text-slate-600">
            <h4 className="font-bold text-indigo-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-600" /> Training Tip
            </h4>
            <p className="leading-relaxed">
              Maintain steady breathing during work sets. Exhale on exertion and inhale during eccentric lowering.
            </p>
            <div className="pt-2 border-t border-indigo-100 flex justify-between font-semibold text-slate-700">
              <span>Work: {timerDuration}s</span>
              <span>Rest: {restDuration}s</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature 1: Interactive Workout Checklist */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Dumbbell className="h-6 w-6 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Today's Workout Checklist: {activeDay.activity}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">Tick off completed sets as you train to keep track of your daily routine.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-500">Progress: {progressPercent}%</div>
              <div className="text-[11px] text-slate-400 font-medium">{completedCount} of {currentExercises.length} items</div>
            </div>
            <button
              onClick={() => resetChecklist(currentExercises.map(e => e.id))}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
          <motion.div 
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
            className="bg-indigo-600 h-full"
          />
        </div>

        {/* Checklist Items */}
        <div className="divide-y divide-slate-100 p-2">
          {currentExercises.map((exercise, idx) => {
            const isChecked = Boolean(checkedExercises[exercise.id]);
            return (
              <motion.div
                key={exercise.id}
                onClick={() => toggleExerciseCheck(exercise.id)}
                className={`p-4 mx-2 my-1 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  isChecked ? 'bg-emerald-50/60 border border-emerald-100' : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    isChecked ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300 text-transparent hover:border-indigo-500'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold transition-all ${
                      isChecked ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}>
                      {exercise.name}
                    </p>
                    <span className="text-xs text-slate-400 font-medium">Target: {exercise.repsOrDuration}</span>
                  </div>
                </div>

                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isChecked 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {isChecked ? 'Done' : 'Pending'}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Adaptive Weekly Schedule Overview with Day Selection */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-slate-500" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Adaptive Weekly Schedule</h2>
              <p className="text-xs text-slate-500">Select any day to preview its specific exercises and target duration.</p>
            </div>
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
            const isSelected = selectedDayIdx === idx;
            return (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + (idx * 0.04) }}
                key={idx} 
                onClick={() => setSelectedDayIdx(idx)}
                className={`p-4 mx-2 my-1 rounded-xl flex items-center justify-between transition-colors group cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-50/80 border border-indigo-200' 
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-6 w-full">
                  <div className="w-28 flex-shrink-0">
                    <span className={`text-sm font-bold uppercase tracking-wider ${
                      isSelected ? 'text-indigo-900' : 'text-slate-900'
                    }`}>
                      {dayPlan.day}
                    </span>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      isRest 
                        ? 'bg-slate-100 text-slate-400' 
                        : isSelected 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-primary-50 text-primary-600'
                    }`}>
                      {isRest ? <Activity className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isRest ? 'text-slate-500' : 'text-slate-800'}`}>
                        {dayPlan.activity}
                      </p>
                      {!isRest && <p className="text-xs text-slate-500 mt-0.5">Target: {plan.workoutDuration} mins</p>}
                    </div>
                  </div>

                  <div className="shrink-0 hidden md:flex items-center gap-2">
                    {isRest ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                        Recovery Day
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        isSelected 
                          ? 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300' 
                          : 'bg-primary-100 text-primary-700 ring-1 ring-primary-200'
                      }`}>
                        Active Training
                      </span>
                    )}
                    <span className="text-xs text-indigo-600 font-semibold group-hover:underline">
                      {isSelected ? 'Selected' : 'View Checklist →'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
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
