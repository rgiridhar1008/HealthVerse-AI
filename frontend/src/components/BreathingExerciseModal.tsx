import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Wind } from 'lucide-react';
import Modal from './Modal';

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

  const currentPhase = phases.length > 0 ? phases[currentPhaseIndex] : null;
  const progress = currentPhase ? ((currentPhase.duration - timeLeft) / currentPhase.duration) * 100 : 0;

  let scale = 1;
  if (currentPhase?.name === 'Inhale') scale = 1 + (progress / 100) * 0.45;
  else if (currentPhase?.name === 'Exhale') scale = 1.45 - (progress / 100) * 0.45;
  else if (currentPhase?.name === 'Hold') scale = 1.45;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleStop();
        onClose();
      }}
      title={title}
      subtitle="Parasympathetic nervous system recovery guide"
      icon={
        <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
          <Wind className="w-5 h-5" />
        </div>
      }
      maxWidth="md"
    >
      <div className="flex flex-col items-center justify-center py-4">
        <p className="text-sm text-slate-500 mb-8 text-center px-4 leading-relaxed">{description}</p>
        
        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
          <motion.div
            className="absolute inset-0 bg-teal-100/80 rounded-full border-4 border-teal-200 shadow-inner"
            animate={{ scale: isActive ? scale : 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
          <div className="relative z-10 flex flex-col items-center justify-center text-teal-900">
            <span className="text-base font-bold uppercase tracking-widest mb-1">
              {isActive && currentPhase ? currentPhase.name : 'Ready'}
            </span>
            <span className="text-5xl font-black tabular-nums">
              {isActive ? timeLeft : phases[0]?.duration || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 w-full">
          {isActive ? (
            <button
              type="button"
              onClick={handlePause}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors shadow-sm"
            >
              <Pause className="w-5 h-5" /> Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              <Play className="w-5 h-5" /> {timeLeft === 0 ? 'Start Session' : 'Resume'}
            </button>
          )}
          <button
            type="button"
            onClick={handleStop}
            disabled={!isActive && timeLeft === 0}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BreathingExerciseModal;
