
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Target, Zap, Shield, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';
import { FitnessLevel, FitnessGoal, UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    name: '',
    level: 'intermediate' as FitnessLevel,
    goal: 'strength' as FitnessGoal,
    equipment: [] as string[]
  });

  const next = () => {
    if (step < 3) setStep(step + 1);
    else onComplete({
      ...data,
      fatigueLevel: 2,
      streak: 0
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050508]">
      <div className="max-w-lg w-full space-y-8 relative">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles size={12} /> Optimization Protocol
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Level <span className="text-gradient">Up Your Life</span>
          </h1>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-cyan-400' : 'w-4 bg-white/10'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <label className="block text-sm font-bold text-white/50 uppercase">Identity Name</label>
                <input
                  type="text"
                  placeholder="Enter your name..."
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full glass-morphism border-white/20 rounded-2xl p-4 text-xl font-medium focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(['strength', 'cardio', 'flexibility', 'weight-loss'] as FitnessGoal[]).map((g) => (
                  <GlassCard 
                    key={g} 
                    onClick={() => setData({ ...data, goal: g })}
                    className={data.goal === g ? 'border-cyan-400' : ''}
                  >
                    <div className="text-center space-y-2">
                      <Target className={`mx-auto ${data.goal === g ? 'text-cyan-400' : 'text-white/20'}`} />
                      <span className="block text-xs font-bold uppercase">{g.replace('-', ' ')}</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold text-center">Select Fitness Magnitude</h3>
              <div className="space-y-3">
                {(['beginner', 'intermediate', 'advanced', 'elite'] as FitnessLevel[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setData({ ...data, level: l })}
                    className={`w-full p-4 rounded-2xl glass-morphism border-white/10 flex items-center justify-between transition-all ${data.level === l ? 'border-cyan-400 bg-cyan-400/10' : ''}`}
                  >
                    <span className="font-bold uppercase tracking-wider">{l}</span>
                    <Zap className={data.level === l ? 'text-cyan-400' : 'text-white/10'} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <GlassCard className="text-center p-8 border-cyan-400/50 bg-cyan-400/5">
                <Shield className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Protocol Ready</h3>
                <p className="text-white/60 text-sm">
                  We've initialized your neural profile. FitFlow AI will now adapt every rep, rest, and routine to your real-time bio-data.
                </p>
              </GlassCard>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-xs text-white/40 leading-relaxed">
                By starting, you allow FitFlow AI to process motion data locally for form correction and optimize routines based on your activity feedback.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={next}
          disabled={step === 1 && !data.name}
          className="w-full bg-cyan-400 text-[#050508] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-300 transition-all disabled:opacity-50"
        >
          {step === 3 ? 'Sync Profile' : 'Proceed Protocol'} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
