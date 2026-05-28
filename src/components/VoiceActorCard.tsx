import React from 'react';
import { VoiceActor } from '../types';
import { Play, Square, Star, Sparkles, Clock, Lock, CreditCard } from 'lucide-react';

interface VoiceActorCardProps {
  actor: VoiceActor;
  onPlayDemo: (actor: VoiceActor, scriptId?: string) => void;
  onBookActor: (actor: VoiceActor) => void;
  isPlaying: boolean;
  activeDemoScriptId?: string;
  isSubscribed: boolean;
  trialSecondsLeft: number;
}

export const VoiceActorCard: React.FC<VoiceActorCardProps> = ({
  actor,
  onPlayDemo,
  onBookActor,
  isPlaying,
  activeDemoScriptId,
  isSubscribed,
  trialSecondsLeft
}) => {
  // Check if this actor is locked for the user
  const isLocked = !actor.isTrialActor && !isSubscribed;

  return (
    <div className="relative group bg-white border border-slate-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-indigo-100 flex flex-col justify-between h-full">
      {/* Top badges */}
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          actor.gender === 'Female' 
            ? 'bg-rose-50 text-rose-700 border border-rose-100' 
            : 'bg-sky-50 text-sky-700 border border-sky-100'
        }`}>
          {actor.gender} • {actor.accent.split('(')[0].trim()}
        </span>
        
        {actor.isTrialActor ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            <Clock className="w-3 h-3 text-amber-700" />
            10m Trial (Free)
          </span>
        ) : isLocked ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <Lock className="w-3 h-3" />
            Requires Plan
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3 h-3" />
            Premium Unlocked
          </span>
        )}
      </div>

      {/* Main Avatar & Profile Section */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border relative shrink-0 shadow-inner ${actor.avatarColor}`}>
          {actor.name.split(' ').map(n => n[0]).join('')}
          <div className="absolute -bottom-1 -right-1 bg-white border border-slate-100 rounded-full py-0.5 px-1.5 shadow-sm flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-bold text-slate-800">{actor.rating}</span>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-base leading-snug hover:text-indigo-600 transition-colors truncate">
            {actor.name}
          </h3>
          <p className="text-xs text-indigo-600 font-medium">{actor.style}</p>
          <p className="text-xs text-slate-500 mt-0.5 italic truncate">"{actor.vocalTone}"</p>
        </div>
      </div>

      {/* Bio / Description */}
      <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed flex-grow">
        {actor.bio}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-5">
        {actor.tags.map((tag, idx) => (
          <span key={idx} className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded transition-colors border border-slate-100">
            #{tag}
          </span>
        ))}
      </div>

      {/* Secondary Demo Play Section */}
      <div className="space-y-2 mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Select Demo Preview</p>
        <div className="space-y-1.5 pt-1">
          {actor.demosList.map((demo) => {
            const isThisPlaying = isPlaying && activeDemoScriptId === demo.id;
            return (
              <button
                key={demo.id}
                id={`btn-play-${actor.id}-${demo.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayDemo(actor, demo.id);
                }}
                className={`w-full flex items-center justify-between text-left p-1.5 rounded-lg text-xs font-medium transition-all ${
                  isThisPlaying 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : isLocked
                      ? 'bg-white hover:bg-slate-100 text-slate-400 border border-slate-150 cursor-pointer'
                      : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-150 cursor-pointer'
                }`}
              >
                <span className="truncate pr-1">{demo.title} ({demo.category})</span>
                {isThisPlaying ? (
                  <Square className="w-3.5 h-3.5 fill-white shrink-0 animate-pulse" />
                ) : (
                  <div className="flex items-center gap-1 shrink-0">
                    {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                    <Play className="w-3 h-3 fill-current shrink-0" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing and Action Buttons */}
      <div className="pt-4 border-t border-slate-100 mt-auto">
        <div className="flex items-baseline justify-between mb-3 text-slate-700">
          <span className="text-xs text-slate-400">Rates starting at:</span>
          <div className="text-right">
            <span className="text-lg font-bold text-slate-800">₹{actor.hourlyRate.toLocaleString('en-IN')}</span>
            <span className="text-xs text-slate-400 font-normal">/hr</span>
            <span className="text-[10px] text-indigo-505 block">or ₹{actor.perWordRate}/word</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            id={`btn-listen-${actor.id}`}
            onClick={() => onPlayDemo(actor)}
            className={`flex items-center justify-center gap-1 py-2 px-3 text-xs font-medium rounded-xl transition-all border ${
              isPlaying && !activeDemoScriptId
                ? 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white'
                : isLocked 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 border-slate-200 cursor-pointer' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer'
            }`}
          >
            {isPlaying && !activeDemoScriptId ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                Stop Demo
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Listen Live
              </>
            )}
          </button>

          <button
            id={`btn-book-${actor.id}`}
            onClick={() => onBookActor(actor)}
            className="flex items-center justify-center gap-1 py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-100 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Book / Hire
          </button>
        </div>
      </div>
    </div>
  );
};
