
import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Activity, ShieldCheck, Zap, Maximize2, AlertTriangle } from 'lucide-react';
import GlassCard from './GlassCard';

const FormAI: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [stats, setStats] = useState({ score: 0, stability: 0, reps: 0 });
  const [feedback, setFeedback] = useState("System ready. Initializing neural movement matrix...");

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (err) {
      setFeedback("Identity scan failed. Camera permissions required.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsActive(false);
  };

  useEffect(() => {
    let animationFrame: number;
    if (isActive && canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const draw = () => {
        if (!ctx || !videoRef.current) return;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const time = Date.now() / 1000;
        const score = Math.floor(88 + Math.sin(time * 2) * 5);
        const stability = Math.floor(92 + Math.cos(time * 1.5) * 4);
        setStats(prev => ({ ...prev, score, stability }));

        if (score < 85) setFeedback("⚠️ Stabilizing core... lift chest slightly.");
        else setFeedback("✅ Neural alignment optimal. Keep pushing.");

        // Futuristic HUD skeleton overlay simulation
        ctx.strokeStyle = score > 85 ? '#22d3ee' : '#f43f5e';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        // Mock joints
        const joints = [[200, 100], [300, 180], [250, 300], [350, 420]];
        ctx.beginPath();
        ctx.moveTo(joints[0][0], joints[0][1]);
        joints.forEach(p => ctx.lineTo(p[0], p[1]));
        ctx.stroke();

        joints.forEach(([x, y]) => {
          ctx.setLineDash([]);
          ctx.fillStyle = score > 85 ? 'rgba(34, 211, 238, 0.4)' : 'rgba(244, 63, 94, 0.4)';
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.stroke();
          
          // Outer pulse
          ctx.beginPath();
          ctx.arc(x, y, 12 + Math.sin(time * 5) * 5, 0, Math.PI * 2);
          ctx.strokeStyle = score > 85 ? 'rgba(34, 211, 238, 0.2)' : 'rgba(244, 63, 94, 0.2)';
          ctx.stroke();
        });

        animationFrame = requestAnimationFrame(draw);
      };
      draw();
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isActive]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-32">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-gradient tracking-tighter">Movement Intelligence</h2>
          <p className="text-white/40 text-sm font-medium">Real-time neural pose validation</p>
        </div>
        <button 
          onClick={isActive ? stopCamera : startCamera}
          className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${isActive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-cyan-500 text-black'}`}
        >
          {isActive ? <CameraOff size={20} /> : <Camera size={20} />}
          {isActive ? 'Terminate Stream' : 'Initialize Vision'}
        </button>
      </div>

      <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden glass-morphism border-2 border-white/10 group shadow-2xl">
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-black/60 z-20 backdrop-blur-md">
            <div className="p-8 rounded-full bg-white/5 border border-white/10 animate-pulse">
              <Activity size={48} className="text-white/20" />
            </div>
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Waiting for vision authorization</p>
          </div>
        )}
        
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale brightness-75 contrast-125" />
        <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {isActive && (
          <div className="absolute inset-x-6 bottom-6 flex gap-4 z-20">
            <div className="flex-1 glass-morphism p-4 rounded-3xl border-white/20 flex items-center gap-4 bg-black/40 backdrop-blur-xl">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                <ShieldCheck className="text-cyan-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Vision Analysis</span>
                <p className="text-sm font-bold text-white/90">{feedback}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="text-center p-4">
          <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block mb-1">Form Score</span>
          <span className="text-3xl font-black text-cyan-400">{stats.score}%</span>
        </GlassCard>
        <GlassCard className="text-center p-4">
          <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block mb-1">Stability</span>
          <span className="text-3xl font-black text-purple-400">{stats.stability}%</span>
        </GlassCard>
        <GlassCard className="text-center p-4">
          <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block mb-1">Rep Count</span>
          <span className="text-3xl font-black text-green-400">{stats.reps}</span>
        </GlassCard>
      </div>
    </div>
  );
};

export default FormAI;
