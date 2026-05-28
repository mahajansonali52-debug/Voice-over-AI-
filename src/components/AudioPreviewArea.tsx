import React, { useState, useEffect, useRef } from 'react';
import { VoiceActor, TestDemoScript } from '../types';
import { Play, Square, Sparkles, Volume2, Music, Wand2, ArrowRight } from 'lucide-react';

interface AudioPreviewAreaProps {
  selectedActor: VoiceActor | null;
  activeScript: string;
  setActiveScript: (script: string) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onSynthesize: (text: string, actor: VoiceActor) => void;
  onStop: () => void;
  isTrialRunning: boolean;
  trialSecondsLeft: number;
  onTriggerFastUpgrade: () => void;
  isSubscribed: boolean;
}

export const AudioPreviewArea: React.FC<AudioPreviewAreaProps> = ({
  selectedActor,
  activeScript,
  setActiveScript,
  isPlaying,
  setIsPlaying,
  onSynthesize,
  onStop,
  isTrialRunning,
  trialSecondsLeft,
  onTriggerFastUpgrade,
  isSubscribed
}) => {
  const [backgroundAmbient, setBackgroundAmbient] = useState<string>('none');
  const [pitch, setPitch] = useState<number>(1);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [mood, setMood] = useState<string>('Warm & Professional');
  const [customText, setCustomText] = useState<string>('');
  
  const [bars, setBars] = useState<number[]>(Array(30).fill(4));
  const animationRef = useRef<number | null>(null);

  // Sync custom script when selectedActor changes
  useEffect(() => {
    if (selectedActor) {
      const defaultDemo = selectedActor.demosList[0]?.scriptText || '';
      setCustomText(defaultDemo);
      setActiveScript(defaultDemo);
    }
  }, [selectedActor]);

  // Update visualizer bars animation when playing
  useEffect(() => {
    if (isPlaying) {
      const updateBars = () => {
        setBars(p => p.map(() => Math.floor(Math.random() * 32) + 4));
        animationRef.current = requestAnimationFrame(updateBars);
      };
      updateBars();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setBars(Array(30).fill(4));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  if (!selectedActor) {
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full border border-slate-800">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-indigo-400">
          <Volume2 className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">AI Voice Synthesis Studio</h3>
        <p className="text-slate-400 text-sm mt-2 max-w-sm">
          Select any voice actor from the marketplace below to open the real-time speech laboratory and test custom scripts.
        </p>
      </div>
    );
  }

  const handlePlayClick = () => {
    if (isPlaying) {
      onStop();
    } else {
      // Trigger voice synthesis or simulated speech play
      onSynthesize(customText, selectedActor);
    }
  };

  const loadPredefinedScript = (script: TestDemoScript) => {
    setCustomText(script.scriptText);
    setActiveScript(script.scriptText);
    setMood(script.suggestedMood);
  };

  const isLocked = !selectedActor.isTrialActor && !isSubscribed;

  // Format trial timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 border border-indigo-950/70 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
      {/* Absolute ambient light leaks */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header section with loaded actor info and Trial countdown if applicable */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border border-slate-700 bg-slate-800 ${selectedActor.isTrialActor ? 'text-amber-400 border-amber-500' : 'text-indigo-400'}`}>
              {selectedActor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-100 leading-none">{selectedActor.name}</h4>
                <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">Loaded Actor</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedActor.gender} • {selectedActor.accent}</p>
            </div>
          </div>

          {/* Trial timer status indicator */}
          {selectedActor.isTrialActor && (
            <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-900/50 py-1.5 px-3.5 rounded-xl">
              <div className="text-right">
                <span className="text-[9px] block uppercase font-extrabold text-amber-500 tracking-widest leading-none">Trial Remaining</span>
                <span className="text-sm font-mono font-bold text-amber-400">{formatTime(trialSecondsLeft)}</span>
              </div>
              <button
                onClick={onTriggerFastUpgrade}
                className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md transition-all shrink-0 cursor-pointer"
              >
                Trigger Paywall
              </button>
            </div>
          )}

          {isLocked && (
            <div className="flex items-center gap-2 bg-red-950/40 border border-red-900/50 py-1 px-3 rounded-lg text-red-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
              Subscription Required to Demo
            </div>
          )}
        </div>

        {/* Script Selector Preset Pills */}
        <div className="mb-4">
          <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block mb-2">Voice Script Archetypes</label>
          <div className="flex flex-wrap gap-1.5">
            {selectedActor.demosList.map((demo) => (
              <button
                key={demo.id}
                id={`btn-preset-script-${demo.id}`}
                onClick={() => loadPredefinedScript(demo)}
                className={`py-1 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  customText === demo.scriptText
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                }`}
              >
                {demo.category} demo
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="mb-4 relative">
          <textarea
            id="text-script-input"
            rows={4}
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              setActiveScript(e.target.value);
            }}
            disabled={isLocked}
            placeholder={isLocked ? "This voice actor requires a Silver or Gold membership. Select Chloe or Ethan to input custom text for free!" : "Type custom commercial copy, e-learning scripts, or documentary prompts here for live synthesis previews..."}
            className={`w-full bg-slate-950 text-slate-100 border text-sm p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none placeholder-slate-600 ${
              isLocked ? 'border-red-950 text-slate-500 cursor-not-allowed bg-slate-900/50' : 'border-slate-800 hover:border-slate-700'
            }`}
          />
          <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono">
            {customText.length} characters • {customText.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>

        {/* Lab Tuning Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/40 border border-slate-800/55 p-3.5 rounded-xl mb-4">
          <div>
            <label className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-indigo-400" />
              Directing Mood
            </label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              disabled={isLocked}
              placeholder="e.g. Energetic / Happy"
              className="w-full bg-transparent text-xs text-slate-200 mt-1 py-1 focus:outline-none focus:border-indigo-500 border-b border-transparent placeholder-slate-700"
            />
          </div>

          <div>
            <label className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Music className="w-3 h-3 text-emerald-400" />
              Music Overlay
            </label>
            <select
              value={backgroundAmbient}
              onChange={(e) => setBackgroundAmbient(e.target.value)}
              disabled={isLocked}
              className="w-full bg-transparent text-xs text-slate-200 mt-1 py-1 border-b border-transparent focus:outline-none cursor-pointer"
            >
              <option value="none" className="bg-slate-950 text-white">No Background</option>
              <option value="cinematic" className="bg-slate-950 text-white">Cinematic Orchestral</option>
              <option value="corporate" className="bg-slate-950 text-white">Upbeat Corporate</option>
              <option value="meditation" className="bg-slate-950 text-white">Calm Healing Spa</option>
            </select>
          </div>

          <div>
            <label className="text-[9px] uppercase font-bold text-slate-400 block">
              Pacing Speed: <span className="font-mono text-indigo-400">{speechRate}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={speechRate}
              disabled={isLocked}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg mt-2 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[9px] uppercase font-bold text-slate-400 block">
              Vocal Pitch: <span className="font-mono text-emerald-400">{pitch}x</span>
            </label>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.1"
              value={pitch}
              disabled={isLocked}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg mt-2 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Visualizer Wave + Player Button controls */}
      <div className="pt-4 border-t border-slate-800/80 mt-auto">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex-1">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 block mb-1">Spectral Waves</span>
            <div className="flex items-end gap-[3px] h-10 bg-slate-950/65 rounded-xl px-4 py-1.5 border border-slate-850">
              {bars.map((barHeight, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-400 rounded-sm flex-1 transition-all duration-75"
                  style={{
                    height: `${isPlaying ? barHeight : 4}px`,
                    opacity: isPlaying ? 0.95 : 0.25
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="text-left">
            <span className="text-xs text-slate-400 block">Estimated Production Fee:</span>
            <span className="text-slate-100 text-sm font-bold">
              ₹{(customText.split(/\s+/).filter(Boolean).length * selectedActor.perWordRate).toLocaleString('en-IN')}{' '} 
              <span className="text-slate-500 text-[10px] font-normal">for {customText.split(/\s+/).filter(Boolean).length} words</span>
            </span>
          </div>

          {isLocked ? (
            <button
              onClick={onTriggerFastUpgrade}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 font-bold text-white text-xs px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              Subscribe to Unlock Voice Actor
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="btn-voice-studio-synthesize"
              onClick={handlePlayClick}
              disabled={!customText.trim()}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  Halt Studio Generation
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Begin AI Script Playback
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
