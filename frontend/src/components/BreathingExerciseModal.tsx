import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Square, Wind } from 'lucide-react';

interface BreathingExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

type Phase = {
  name: string;
  duration: number;
};

const BreathingExerciseModal: React.FC<BreathingExerciseModalProps> = ({
  isOpen,
  onClose,
  title,
  description
}) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Setup phases based on title
  useEffect(() => {
    if (title.includes('4-7-8')) {
      setPhases([
        { name: 'Inhale', duration: 4 },
        { name: 'Hold', duration: 7 },
        { name: 'Exhale', duration: 8 }
      ]);
    } else if (title.includes('Box Breathing')) {
      setPhases([
        { name: 'Inhale', duration: 4 },
        { name: 'Hold', duration: 4 },
        { name: 'Exhale', duration: 4 },
        { name: 'Hold', duration: 4 }
      ]);
    } else {
      // Default
      setPhases([
        { name: 'Inhale', duration: 4 },
        { name: 'Exhale', duration: 4 }
      ]);
    }
  }, [title]);

  useEffect(() => {
    if (!isOpen) {
      handleStop();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && phases.length > 0) {
      if (timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else {
        // Move to next phase
        const nextIndex = (currentPhaseIndex + 1) % phases.length;
        setCurrentPhaseIndex(nextIndex);
        setTimeLeft(phases[nextIndex].duration);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentPhaseIndex, phases]);

  const handleStart = () => {
    if (!isActive && timeLeft === 0 && phases.length > 0) {
      setCurrentPhaseIndex(0);
      setTimeLeft(phases[0].duration);
    }
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleStop = () => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setTimeLeft(0);
  };

  if (!isOpen) return null;

  const currentPhase = phases.length > 0 ? phases[currentPhaseIndex] : null;
  const progress = currentPhase ? ((currentPhase.duration - timeLeft) / currentPhase.duration) * 100 : 0;

  // Determine circle scale based on phase
  let scale = 1;
  if (currentPhase?.name === 'Inhale') scale = 1 + (progress / 100) * 0.5; // grows to 1.5
  else if (currentPhase?.name === 'Exhale') scale = 1.5 - (progress / 100) * 0.5; // shrinks to 1
  else if (currentPhase?.name === 'Hold') scale = currentPhaseIndex === 1 && phases.length === 3 ? 1.5 : (currentPhaseIndex === 1 ? 1.5 : 1); // 4-7-8 hold is large, box breathing holds are large then small depending on index.

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2 text-teal-700">
              <Wind className="w-5 h-5" />
              <h2 className="font-bold text-lg">{title}</h2>
            </div>
            <button
              onClick={() => {
                handleStop();
                onClose();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-8 flex-1 flex flex-col items-center justify-center min-h-[300px]">
            <p className="text-sm text-slate-500 mb-8 text-center px-4">{description}</p>
            
            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
              {/* Breathing Circle */}
              <motion.div
                className="absolute inset-0 bg-teal-100 rounded-full border-4 border-teal-200 shadow-inner"
                animate={{ scale: isActive ? scale : 1 }}
                transition={{ duration: isActive && (currentPhase?.name === 'Inhale' || currentPhase?.name === 'Exhale') ? 1 : 0, ease: 'linear' }}
              />
              <div className="relative z-10 flex flex-col items-center justify-center text-teal-800">
                <span className="text-xl font-bold uppercase tracking-widest mb-1">
                  {isActive && currentPhase ? currentPhase.name : 'Ready'}
                </span>
                <span className="text-5xl font-black tabular-nums">
                  {isActive ? timeLeft : phases[0]?.duration || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-auto">
              {isActive ? (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors shadow-sm"
                >
                  <Pause className="w-5 h-5" /> Pause
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  <Play className="w-5 h-5" /> {timeLeft === 0 ? 'Start' : 'Resume'}
                </button>
              )}
              <button
                onClick={handleStop}
                disabled={!isActive && timeLeft === 0}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Square className="w-5 h-5" /> Stop
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BreathingExerciseModal;
