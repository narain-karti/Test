
import React, { useState, useRef } from 'react';
// Fixed: Replace non-existent Lucide icon 'AspectRatio' with 'Maximize2'
import { Image as ImageIcon, Wand2, RefreshCw, Download, Layers, Maximize2 as AspectRatioIcon, Search, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import { AspectRatio } from '../types';
import { generateImage, editImageWithPrompt } from '../services/geminiService';

const VisionLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatios: AspectRatio[] = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const img = await generateImage(prompt, aspectRatio);
      setResultImage(img);
    } catch (err) {
      alert("Neural synthesis failed. Check protocol logs.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!resultImage || !editPrompt.trim()) return;
    setIsEditing(true);
    try {
      const img = await editImageWithPrompt(resultImage, editPrompt, 'image/png');
      setResultImage(img);
      setEditPrompt('');
    } catch (err) {
      alert("Neural edit failed.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResultImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-32">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gradient">Vision Lab</h2>
        <p className="text-white/40 text-sm">Neural asset synthesis & multimodal understanding</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Panel: Generation Controls */}
        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="text-cyan-400" size={20} />
              <h3 className="font-bold">Neural Synthesis</h3>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a fitness environment or motivational art..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-500 min-h-[100px] resize-none"
            />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                <AspectRatioIcon size={12} /> Aspect Ratio
              </div>
              <div className="grid grid-cols-4 gap-2">
                {aspectRatios.map(ar => (
                  <button
                    key={ar}
                    onClick={() => setAspectRatio(ar)}
                    className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${aspectRatio === ar ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-cyan-400 text-[#050508] font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-300 transition-all disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="animate-spin" /> : <Wand2 size={20} />}
              GENERATE ASSET
            </button>
          </GlassCard>

          {resultImage && (
            <GlassCard className="space-y-4 border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="text-purple-400" size={20} />
                <h3 className="font-bold">Neural Modifier</h3>
              </div>
              <input
                type="text"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="e.g., 'Add a retro cyberpunk filter'"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleEdit}
                disabled={isEditing || !editPrompt.trim()}
                className="w-full bg-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-400 transition-all disabled:opacity-50"
              >
                {isEditing ? <RefreshCw className="animate-spin" /> : 'APPLY MODIFICATION'}
              </button>
            </GlassCard>
          )}
        </div>

        {/* Right Panel: Preview Area */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] md:aspect-square rounded-[2rem] overflow-hidden glass-morphism border-2 border-white/10 flex items-center justify-center group">
            <AnimatePresence mode="wait">
              {resultImage ? (
                <motion.img
                  key={resultImage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={resultImage}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-8">
                  <Eye size={48} className="mx-auto text-white/10 mb-4" />
                  <p className="text-white/30 font-medium">No asset initialized</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-4 py-2 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/5"
                  >
                    Upload Local Matrix
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                </div>
              )}
            </AnimatePresence>

            {resultImage && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="p-3 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 text-white hover:scale-110 transition-transform">
                  <Download size={18} />
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <GlassCard className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Search size={16} />
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase">Resolution</span>
                  <span className="text-sm font-bold">4K Native</span>
                </div>
             </GlassCard>
             <GlassCard className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                  <Search size={16} />
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase">AI Engine</span>
                  <span className="text-sm font-bold">Pro Vision 3.0</span>
                </div>
             </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionLab;
