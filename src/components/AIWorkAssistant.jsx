import React, { useState, useEffect } from 'react';

const AIWorkAssistant = ({
  isOpen,
  onClose,
  messages,
  onSummarize,
  onAssistantQuery,
  onVoiceToText,
  onImageGenerate,
  chatSummary,
  isSummarizing
}) => {
  const [query, setQuery] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US'); // Default to English
  const [isRecording, setIsRecording] = useState(false);

  if (!isOpen) return null;

  const handleVoiceTool = (lang) => {
    setVoiceLang(lang);
    setIsRecording(true);
    onVoiceToText(lang);
    // Auto reset recording state after some time or when prop changes if we had it
    setTimeout(() => setIsRecording(false), 5000);
  };

  const handleImageGen = () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    onImageGenerate(imagePrompt);
    setImagePrompt('');
    setTimeout(() => setIsGeneratingImage(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-slate-900 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(79,142,247,0.3)] border border-white/10 relative">

        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/20 blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg animate-pulse">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">AI Work Assistant</h2>
              <p className="text-xs text-indigo-300/60 font-medium uppercase tracking-widest">Powered by Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-red-500/20 hover:text-red-400 transition-all active:scale-90 border border-white/5"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-10 custom-scrollbar relative z-10">

          {/* Feature: Assistant Chat */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-500/10 p-1.5 rounded-lg text-purple-400">💬</span>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Intelligent Query</h3>
            </div>
            <div className="flex flex-col gap-3">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Ask me anything... (e.g. Write a project email)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && query.trim() && (onAssistantQuery(query), setQuery(''))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
                <button
                  onClick={() => query.trim() && (onAssistantQuery(query), setQuery(''))}
                  disabled={!query.trim()}
                  className="absolute right-3 top-2.5 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-500 transition-all disabled:opacity-30 active:scale-95 shadow-lg shadow-indigo-600/20"
                >
                  Ask AI
                </button>
              </div>
            </div>
          </section>

          {/* Feature: Summarizer */}
          <section className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-bold text-white leading-none">Chat Synopsis</h3>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight font-medium">Automatic context analysis</p>
                </div>
              </div>
              <button
                onClick={onSummarize}
                disabled={isSummarizing || messages.length === 0}
                className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-xl ${isSummarizing || messages.length === 0
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                    : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 active:scale-95 shadow-indigo-900/40'
                  }`}
              >
                {isSummarizing ? 'Analyzing...' : 'Summarize'}
              </button>
            </div>
            {chatSummary && (
              <div className="bg-indigo-500/5 border border-indigo-500/20 p-5 rounded-2xl animate-in slide-in-from-top-4">
                <p className="text-sm font-medium text-indigo-100/90 leading-relaxed whitespace-pre-line italic">
                  "{chatSummary}"
                </p>
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature: Voice Tool */}
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 group hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl shadow-lg border border-indigo-500/20">🎙️</div>
                <h4 className="font-bold text-white text-sm">Voice Transcription</h4>
              </div>
              <p className="text-[10px] text-gray-400 mb-4 uppercase font-bold tracking-widest">Select Language</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleVoiceTool('en-US')}
                  className="flex items-center justify-between group/btn bg-white/5 hover:bg-indigo-600 p-3 rounded-xl transition-all border border-white/5 hover:border-indigo-500"
                >
                  <span className="text-xs font-bold text-indigo-300 group-hover/btn:text-white">English (US)</span>
                  <span className="text-[10px] opacity-40 group-hover/btn:opacity-100 transition-opacity">Record →</span>
                </button>
                <button
                  onClick={() => handleVoiceTool('ur-PK')}
                  className="flex items-center justify-between group/btn bg-white/5 hover:bg-purple-600 p-3 rounded-xl transition-all border border-white/5 hover:border-purple-500"
                >
                  <span className="text-xs font-bold text-purple-300 group-hover/btn:text-white">Urdu (اردو)</span>
                  <span className="text-[10px] opacity-40 group-hover/btn:opacity-100 transition-opacity">Record →</span>
                </button>
              </div>
              {isRecording && (
                <div className="mt-4 flex items-center gap-2 animate-pulse text-red-400 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div> Listening...
                </div>
              )}
            </div>

            {/* Feature: Image Studio */}
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 group hover:border-pink-500/30 transition-all">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-xl shadow-lg border border-pink-500/20">🎨</div>
                <h4 className="font-bold text-white text-sm">Image Studio</h4>
              </div>
              <textarea
                placeholder="Describe image... (e.g. A cat in space)"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500/50 resize-none mb-3"
              />
              <button
                onClick={handleImageGen}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-pink-900/20 disabled:opacity-20"
              >
                {isGeneratingImage ? 'Generating...' : 'Magic Generate'}
              </button>
            </div>
          </div>

        </div>

        <div className="p-6 bg-black/40 border-t border-white/5 flex flex-col items-center gap-2">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">ShareHub AI Protocol v2.0</p>
          <div className="flex gap-4">
            <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
            <div className="w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></div>
            <div className="w-1 h-1 bg-pink-500 rounded-full"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIWorkAssistant;
