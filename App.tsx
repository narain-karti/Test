
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Flame, 
  BrainCircuit, 
  TrendingUp, 
  CheckCircle,
  Activity,
  Heart,
  Moon,
  Zap,
  ChevronRight,
  Sparkles,
  Trophy,
  History,
  Star,
  Volume2,
  RefreshCw,
  Dumbbell,
  Wind,
  StretchHorizontal
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Tooltip
} from 'recharts';

import Background3D from './components/Background3D';
import GlassCard from './components/GlassCard';
import Navbar, { Tab } from './components/Navbar';
import FormAI from './components/FormAI';
import FlowBot from './components/FlowBot';
import Onboarding from './components/Onboarding';
import VisionLab from './components/VisionLab';
import { INITIAL_WORKOUTS, BADGE_ICONS } from './constants';
import { UserProfile, Workout, WorkoutType } from './types';
import { generateAdaptiveWorkout, generateTTS } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('fitflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeTab, setActiveTab] = useState<Tab>('workout');
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<Workout>(INITIAL_WORKOUTS['Strength']);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [isAdapting, setIsAdapting] = useState(false);
  const [isNarrationPlaying, setIsNarrationPlaying] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fitflow_user', JSON.stringify(user));
    }
  }, [user]);

  const handleOnboarding = (profile: UserProfile) => {
    setUser(profile);
    setShowAchievement('Neural Link Established');
    setTimeout(() => setShowAchievement(null), 3000);
  };

  const adaptWorkout = async (type: WorkoutType) => {
    if (!user) return;
    setIsAdapting(true);
    const newWorkout = await generateAdaptiveWorkout(user, type);
    setCurrentWorkout(newWorkout);
    setIsAdapting(false);
  };

  const playNarration = async (text: string) => {
    if (isNarrationPlaying) return;
    setIsNarrationPlaying(true);
    try {
      const base64 = await generateTTS(text);
      if (base64) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsNarrationPlaying(false);
        source.start();
      }
    } catch (e) {
      console.error(e);
      setIsNarrationPlaying(false);
    }
  };

  if (!user) {
    return (
      <>
        <Background3D />
        <Onboarding onComplete={handleOnboarding} />
      </>
    );
  }

  const progressData = [
    { name: 'Mon', power: 65, form: 70 },
    { name: 'Tue', power: 75, form: 82 },
    { name: 'Wed', power: 70, form: 88 },
    { name: 'Thu', power: 85, font: 92 },
    { name: 'Fri', power: 90, form: 95 },
  ];

  const workoutTypes: { id: WorkoutType, icon: any, label: string }[] = [
    { id: 'Strength', icon: Dumbbell, label: 'Strength' },
    { id: 'Cardio', icon: Wind, label: 'Cardio' },
    { id: 'Flexibility', icon: StretchHorizontal, label: 'Flexibility' },
    { id: 'Recovery', icon: Moon, label: 'Recovery' }
  ];

  return (
    <div className="min-h-screen pb-40 overflow-x-hidden">
      <Background3D />
      
      {/* Immersive Header */}
      <header className="px-6 pt-12 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full rounded-[14px] bg-[#050508] flex items-center justify-center overflow-hidden">
                <img src={`https://picsum.photos/seed/${user.name}/100`} alt="Avatar" className="w-full h-full object-cover brightness-110 grayscale-[0.2]" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-black flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter">Protocol {user.name}</h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md">{user.level}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{user.streak}d Streak</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-3 rounded-2xl glass-morphism border-white/10 text-orange-400 hover:scale-110 transition-transform">
            <Flame size={20} />
          </button>
        </div>
      </header>

      <main className="px-6 space-y-8 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'workout' && (
            <motion.div 
              key="workout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Daily Fitness Narrative (Psychological Hook) */}
              <GlassCard className="bg-gradient-to-br from-cyan-950/40 to-black/60 border-cyan-500/20 py-10 text-center group relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4">
                    <button 
                      onClick={() => playNarration(currentWorkout.neuralInsight || "")}
                      className={`p-2 rounded-full glass-morphism border-white/10 text-white/30 hover:text-cyan-400 transition-colors ${isNarrationPlaying ? 'text-cyan-400 animate-pulse' : ''}`}
                    >
                      <Volume2 size={16} />
                    </button>
                 </div>
                 <Sparkles className="mx-auto text-cyan-400 mb-4 group-hover:scale-125 transition-transform" size={40} />
                 <h2 className="text-2xl font-black mb-3 italic leading-tight">
                   "{currentWorkout.neuralInsight || "Today is your consistency node."}"
                 </h2>
                 <p className="text-white/60 text-sm max-w-[85%] mx-auto leading-relaxed font-medium">
                   {currentWorkout.explanation}
                 </p>
              </GlassCard>

              {/* Workout Type Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <Zap size={16} className="text-cyan-400" /> Neural Recalibration
                  </h3>
                  {isAdapting && <RefreshCw className="animate-spin text-cyan-400" size={16} />}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {workoutTypes.map((t) => {
                    const Icon = t.icon;
                    const isSelected = currentWorkout.type === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => adaptWorkout(t.id)}
                        disabled={isAdapting}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${isSelected ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'glass-morphism border-white/10 text-white/40 hover:bg-white/5'}`}
                      >
                        <Icon size={20} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Workout Protocol */}
              <GlassCard className="border-white/10 overflow-hidden shadow-2xl relative">
                {isAdapting && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-4">
                     <BrainCircuit className="text-cyan-400 animate-pulse" size={48} />
                     <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400">Neural Sync in Progress</p>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-black mb-1 tracking-tighter">{currentWorkout.title}</h3>
                    <div className="flex gap-4 text-xs text-white/40 font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock size={12} /> {currentWorkout.estimatedTime}m</span>
                      <span className="flex items-center gap-1"><TrendingUp size={12} /> {currentWorkout.difficulty}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-[1.5rem] bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                    <BrainCircuit size={28} />
                  </div>
                </div>

                <div className="space-y-4">
                  {currentWorkout.exercises.map((ex, i) => (
                    <div key={ex.id} className="flex items-center justify-between p-5 rounded-[2rem] bg-white/[0.03] hover:bg-white/[0.08] transition-all group border border-transparent hover:border-white/10">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-black text-white/30 group-hover:bg-cyan-400 group-hover:text-black transition-all shadow-inner">
                          0{i+1}
                        </div>
                        <div>
                          <p className="text-base font-black tracking-tight">{ex.name}</p>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{ex.muscles.join(' • ')}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black bg-cyan-500/10 px-4 py-2 rounded-full text-cyan-400 border border-cyan-500/20">
                        {ex.reps || `${ex.duration}s`}
                      </span>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-10 bg-cyan-400 text-black font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 hover:bg-cyan-300 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(34,211,238,0.3)]">
                  INITIALIZE PROTOCOL <Play size={20} fill="currentColor" />
                </button>
              </GlassCard>

              {/* Real-time Insights (Human-centric) */}
              <div className="grid grid-cols-2 gap-4">
                 <GlassCard className="p-6 border-red-500/10 bg-red-500/[0.02]">
                    <div className="flex items-center gap-2 text-white/40 mb-4">
                       <Heart size={16} className="text-red-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Vascular Readiness</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                       <span className="text-5xl font-black">58</span>
                       <span className="text-xs text-white/30 font-bold uppercase">bpm</span>
                    </div>
                    <p className="text-[10px] text-green-400 font-bold mt-4 uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle size={10} /> Optimal recovery state
                    </p>
                 </GlassCard>
                 <GlassCard className="p-6 border-indigo-500/10 bg-indigo-500/[0.02]">
                    <div className="flex items-center gap-2 text-white/40 mb-4">
                       <Moon size={16} className="text-indigo-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Neural Sleep</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                       <span className="text-5xl font-black">92</span>
                       <span className="text-xs text-white/30 font-bold uppercase">%</span>
                    </div>
                    <p className="text-[10px] text-indigo-400 font-bold mt-4 uppercase tracking-widest">+12% Deep Nodes</p>
                 </GlassCard>
              </div>
            </motion.div>
          )}

          {activeTab === 'form' && <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><FormAI /></motion.div>}
          {activeTab === 'lab' && <motion.div key="lab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><VisionLab /></motion.div>}
          
          {activeTab === 'progress' && (
            <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-gradient tracking-tighter">Growth Matrix</h2>
                <p className="text-white/40 text-sm font-medium">Historical neural performance nodes</p>
              </div>

              <GlassCard className="h-[320px] p-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="power" stroke="#22d3ee" fillOpacity={1} fill="url(#colorPower)" strokeWidth={4} />
                    <Area type="monotone" dataKey="form" stroke="#a855f7" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </GlassCard>

              <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-6">
                  <Activity className="text-cyan-400 mb-4" size={24} />
                  <span className="block text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Cumulative Reps</span>
                  <span className="text-4xl font-black">12,450</span>
                </GlassCard>
                <GlassCard className="p-6">
                  <Trophy className="text-yellow-400 mb-4" size={24} />
                  <span className="block text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Peak Form</span>
                  <span className="text-4xl font-black">98%</span>
                </GlassCard>
              </div>
              
              <h3 className="text-xl font-black tracking-tight mt-12 flex items-center gap-2">
                <History size={20} className="text-white/30" /> Identity Badges
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 pt-2">
                 {Object.entries(BADGE_ICONS).map(([name, icon]) => (
                   <div key={name} className="flex-shrink-0 flex flex-col items-center gap-3">
                     <div className="w-20 h-20 rounded-3xl glass-morphism flex items-center justify-center border-white/5 hover:border-cyan-400/30 hover:bg-white/5 transition-all group">
                       <div className="group-hover:scale-110 transition-transform">{icon}</div>
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/30 text-center w-20 leading-tight">{name}</span>
                   </div>
                 ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
             <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-gradient tracking-tighter">Configurations</h2>
                  <p className="text-white/40 text-sm font-medium">Neural interface parameters</p>
                </div>
                
                <div className="space-y-4">
                   <GlassCard className="p-6">
                      <div className="flex items-center justify-between">
                         <div className="flex flex-col gap-1">
                            <span className="text-sm font-black">Neural Haptics</span>
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Rep confirmation vibrations</span>
                         </div>
                         <div className="w-14 h-7 rounded-full bg-cyan-400/20 border border-cyan-400/40 relative p-1 cursor-pointer">
                            <div className="w-5 h-5 bg-cyan-400 rounded-full float-right shadow-lg shadow-cyan-500/50" />
                         </div>
                      </div>
                   </GlassCard>
                   <GlassCard className="p-6 opacity-50">
                      <div className="flex items-center justify-between">
                         <div className="flex flex-col gap-1">
                            <span className="text-sm font-black">AI Voice Protocols</span>
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Real-time coaching audio</span>
                         </div>
                         <div className="w-14 h-7 rounded-full bg-white/5 border border-white/10 relative p-1">
                            <div className="w-5 h-5 bg-white/20 rounded-full" />
                         </div>
                      </div>
                   </GlassCard>
                </div>
                
                <button 
                  onClick={() => { localStorage.clear(); window.location.reload(); }}
                  className="w-full p-6 rounded-[2.5rem] bg-red-500/5 text-red-500 font-black uppercase tracking-[0.2em] text-[10px] border border-red-500/10 hover:bg-red-500/10 transition-all"
                >
                  Terminate Connection Profile
                </button>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Achievement Popup Overlay */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none p-6"
          >
            <GlassCard className="bg-cyan-500/20 border-cyan-400 text-center py-12 px-16 shadow-[0_0_80px_rgba(34,211,238,0.3)] backdrop-blur-2xl">
              <Star className="w-20 h-20 text-cyan-400 mx-auto mb-6 animate-spin-slow" />
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Protocol Enhanced</h2>
              <p className="text-cyan-100 font-black tracking-widest uppercase text-xs">{showAchievement}</p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onBotClick={() => setIsBotOpen(true)} />
      
      <FlowBot 
        profile={user} 
        currentWorkout={currentWorkout} 
        isOpen={isBotOpen} 
        onClose={() => setIsBotOpen(false)} 
      />
    </div>
  );
};

export default App;
