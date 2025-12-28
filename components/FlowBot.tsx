
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Mic, X, Paperclip, Brain, Globe, MapPin, Zap, Volume2, Square, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBotResponse, generateTTS, transcribeAudioData } from '../services/geminiService';
import { UserProfile, Workout, BotMessage, BotMode, MediaItem } from '../types';

interface FlowBotProps {
  profile: UserProfile;
  currentWorkout: Workout | null;
  isOpen: boolean;
  onClose: () => void;
}

const FlowBot: React.FC<FlowBotProps> = ({ profile, currentWorkout, isOpen, onClose }) => {
  const [messages, setMessages] = useState<BotMessage[]>([
    { role: 'assistant', content: `Greetings ${profile.name}! I'm FlowBot. How can I optimize your performance today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<BotMode>('standard');
  const [pendingMedia, setPendingMedia] = useState<MediaItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if ((!input.trim() && pendingMedia.length === 0) || isLoading) return;

    const userMsg = input.trim();
    const activeMedia = [...pendingMedia];
    
    setInput('');
    setPendingMedia([]);
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMsg || (activeMedia.length > 0 ? "[Media Uploaded]" : ""),
      media: activeMedia 
    }]);
    
    setIsLoading(true);

    let location;
    if (mode === 'maps') {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
        location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch (e) {
        console.warn("Location denied");
      }
    }

    const response = await getBotResponse(userMsg, mode, profile, currentWorkout, activeMedia, location);
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: response.text,
      urls: response.urls 
    }]);
    setIsLoading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      // Fix: Explicitly type BlobEvent to ensure the 'data' property is recognized as a Blob.
      recorder.ondataavailable = (e: BlobEvent) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          setIsLoading(true);
          const transcription = await transcribeAudioData(base64, 'audio/webm');
          setInput(prev => (prev ? prev + " " + transcription : transcription));
          setIsLoading(false);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Fix: Explicitly cast to File[] to prevent 'file' from being inferred as 'unknown'.
    const files = Array.from(e.target.files || []) as File[];
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image';
        setPendingMedia(prev => [...prev, {
          type,
          data: reader.result as string,
          mimeType: file.type,
          previewUrl: type === 'image' ? (reader.result as string) : undefined
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const playTTS = async (text: string, index: number) => {
    const base64 = await generateTTS(text);
    if (!base64) return;
    
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioContextRef.current;
    
    // PCM 24000Hz 16bit Mono decoding logic matching instructions
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    setMessages(prev => prev.map((m, i) => i === index ? { ...m, isAudioPlaying: true } : m));
    source.onended = () => {
      setMessages(prev => prev.map((m, i) => i === index ? { ...m, isAudioPlaying: false } : m));
    };
    source.start();
  };

  const modeIcons: Record<BotMode, any> = {
    standard: Sparkles,
    lite: Zap,
    thinking: Brain,
    search: Globe,
    maps: MapPin
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-2xl mx-auto glass-morphism rounded-[2.5rem] border-white/20 shadow-2xl h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center neon-glow-cyan">
                  <Bot className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">FlowBot</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {Object.entries(modeIcons).map(([m, Icon]) => (
                      <button 
                        key={m}
                        onClick={() => setMode(m as BotMode)}
                        className={`p-1 rounded-md transition-all ${mode === m ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/20 hover:text-white/40'}`}
                        title={m}
                      >
                        <Icon size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <X size={24} className="text-white/50" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl ${m.role === 'user' ? 'bg-cyan-500 text-white rounded-tr-none' : 'glass-morphism border-white/10 text-white/90 rounded-tl-none'}`}>
                    {m.media && m.media.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {m.media.map((med, idx) => (
                          <div key={idx} className="rounded-xl overflow-hidden border border-white/10">
                            {med.type === 'image' && <img src={med.data} alt="Upload" className="w-full h-auto" />}
                            {(med.type === 'video' || med.type === 'audio') && <div className="p-3 text-[10px] uppercase font-bold text-white/40">{med.type} Matrix</div>}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    
                    {m.urls && (
                      <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-white/10">
                        {m.urls.map((url, idx) => (
                          <a key={idx} href={url.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-cyan-400 hover:bg-white/10">
                            <ExternalLink size={10} /> {url.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {m.role === 'assistant' && (
                    <button 
                      onClick={() => playTTS(m.content, i)}
                      className={`mt-2 p-2 rounded-full glass-morphism border-white/10 text-white/30 hover:text-cyan-400 transition-colors ${m.isAudioPlaying ? 'text-cyan-400 animate-pulse' : ''}`}
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="glass-morphism p-4 rounded-3xl border-white/10 rounded-tl-none flex gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-white/10 bg-white/5 space-y-4">
              {pendingMedia.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {pendingMedia.map((med, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-16 h-16 rounded-xl border border-white/20 overflow-hidden bg-black/40">
                      {med.type === 'image' ? <img src={med.data} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] font-bold uppercase">{med.type}</div>}
                      <button onClick={() => setPendingMedia(prev => prev.filter((_, i) => i !== idx))} className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 rounded-full"><X size={10} /></button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={`Ask FlowBot in ${mode} mode...`}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-32 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <div className="absolute left-3 top-3.5 flex gap-1">
                   <button onClick={() => mediaInputRef.current?.click()} className="p-1 text-white/40 hover:text-cyan-400">
                     <Paperclip size={20} />
                   </button>
                   <input type="file" ref={mediaInputRef} onChange={handleFileUpload} className="hidden" multiple accept="image/*,video/*,audio/*" />
                </div>
                <div className="absolute right-2 top-2 flex gap-1">
                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-white/40 hover:text-white'}`}
                  >
                    {isRecording ? <Square size={20} fill="white" /> : <Mic size={20} />}
                  </button>
                  <button 
                    onClick={handleSend}
                    disabled={(!input.trim() && pendingMedia.length === 0) || isLoading}
                    className="p-2 bg-cyan-500 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Powered by Gemini 3 Pro Neural Core</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlowBot;
