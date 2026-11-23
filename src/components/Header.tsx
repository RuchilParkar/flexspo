import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Trophy, HelpCircle } from 'lucide-react';
import { soundService } from '../services/sound';
import { PersonalBestRecord } from '../types';

interface HeaderProps {
  personalBest: PersonalBestRecord | null;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ personalBest, onOpenHelp }) => {
  const [soundEnabled, setSoundEnabled] = useState(soundService.isEnabled());

  useEffect(() => {
    setSoundEnabled(soundService.isEnabled());
  }, []);

  const handleToggleSound = () => {
    const next = soundService.toggle();
    setSoundEnabled(next);
  };

  return (
    <header className="w-full max-w-5xl lg:max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/[0.06]">
      {/* Brand & Subtitle */}
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-bold tracking-tight text-white font-mono flex items-center gap-1.5 select-none">
          <span className="w-2 h-2 rounded-[1px] bg-amber-400 inline-block mr-0.5" aria-hidden="true" />
          <span>flexspo</span>

        </h1>
        <span className="text-xs text-dark-muted font-sans border-l border-white/[0.08] pl-3">
          Test your speed, unlock your flow
        </span>
      </div>

      {/* Right Controls: Telemetry Best & Quick Toggles */}
      <div className="flex items-center gap-4 text-xs font-mono">
        {/* Personal Best Telemetry */}
        <div
          className="flex items-center gap-2 text-dark-muted"
          title={
            personalBest
              ? `Personal Best: ${personalBest.bestWpm} WPM (${personalBest.accuracy}% accuracy, ${personalBest.difficulty})`
              : 'Complete a test to establish baseline'
          }
        >
          <Trophy className={`w-3.5 h-3.5 ${personalBest ? 'text-amber-400' : 'text-dark-faint'}`} />
          <span className="text-dark-faint uppercase tracking-wider text-[11px]">Best</span>
          <span className="text-white font-semibold tabular-nums">
            {personalBest ? `${personalBest.bestWpm} WPM` : '—'}
          </span>
          {personalBest && (
            <span className="text-dark-muted hidden md:inline text-[11px] tabular-nums">
              ({personalBest.accuracy}%)
            </span>
          )}
        </div>

        <div className="h-3 w-px bg-white/[0.08]" aria-hidden="true" />

        {/* Audio Toggle */}
        <button
          onClick={handleToggleSound}
          aria-label={soundEnabled ? 'Mute typing sounds' : 'Enable typing sounds'}
          className={`p-1.5 rounded transition-colors ${soundEnabled
            ? 'text-amber-400 hover:text-amber-300'
            : 'text-dark-faint hover:text-dark-muted'
            }`}
          title={soundEnabled ? 'Sound Effects: ON' : 'Sound Effects: OFF'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Keyboard Shortcuts Help */}
        <button
          onClick={onOpenHelp}
          aria-label="View keyboard shortcuts"
          className="p-1.5 rounded text-dark-faint hover:text-dark-muted transition-colors"
          title="Keyboard shortcuts (Help)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
