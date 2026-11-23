import React from 'react';
import { RotateCcw, Play } from 'lucide-react';
import { Difficulty, TestMode, TestStatus } from '../types';

interface ControlsProps {
  difficulty: Difficulty;
  mode: TestMode;
  status: TestStatus;
  onSelectDifficulty: (diff: Difficulty) => void;
  onSelectMode: (mode: TestMode) => void;
  onStart: () => void;
  onRestart: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  difficulty,
  mode,
  status,
  onSelectDifficulty,
  onSelectMode,
  onStart,
  onRestart,
}) => {
  const isRunning = status === 'running';

  const difficulties: { key: Difficulty; label: string; desc: string }[] = [
    { key: 'easy', label: 'Easy', desc: 'Simple vocabulary and short sentences' },
    { key: 'medium', label: 'Medium', desc: 'Standard sentences and punctuation' },
    { key: 'hard', label: 'Hard', desc: 'Complex structures and technical prose' },
    { key: 'extreme', label: 'Extreme', desc: 'Advanced theoretical syntax' },
  ];

  return (
    <nav
      aria-label="Test configuration and controls"
      className="w-full max-w-5xl lg:max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono select-none"
    >
      {/* Mode & Difficulty Unified Segment */}
      <div className="flex flex-wrap items-center gap-4 text-dark-muted">
        {/* Mode Selector */}
        <div role="group" aria-label="Select test mode" className="flex items-center gap-1">
          <button
            onClick={() => onSelectMode('timed')}
            disabled={isRunning}
            aria-pressed={mode === 'timed'}
            className={`px-2.5 py-1 rounded transition-colors ${
              mode === 'timed'
                ? 'text-white font-semibold bg-white/[0.08]'
                : 'text-dark-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title={isRunning ? 'Restart test to change mode' : '60-second countdown'}
          >
            Timed (60s)
          </button>

          <span className="text-white/[0.15]" aria-hidden="true">/</span>

          <button
            onClick={() => onSelectMode('passage')}
            disabled={isRunning}
            aria-pressed={mode === 'passage'}
            className={`px-2.5 py-1 rounded transition-colors ${
              mode === 'passage'
                ? 'text-white font-semibold bg-white/[0.08]'
                : 'text-dark-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title={isRunning ? 'Restart test to change mode' : 'Full passage mode'}
          >
            Passage
          </button>
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-white/[0.08]" aria-hidden="true" />

        {/* Difficulty Selector */}
        <div role="group" aria-label="Select difficulty level" className="flex items-center gap-1">
          {difficulties.map((d, idx) => {
            const active = difficulty === d.key;
            return (
              <React.Fragment key={d.key}>
                {idx > 0 && <span className="text-white/[0.12] hidden md:inline" aria-hidden="true">·</span>}
                <button
                  onClick={() => onSelectDifficulty(d.key)}
                  aria-pressed={active}
                  className={`px-2 py-1 rounded transition-colors ${
                    active
                      ? 'text-amber-400 font-semibold bg-amber-400/10'
                      : 'text-dark-muted hover:text-white'
                  }`}
                  title={d.desc}
                >
                  {d.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Action Buttons: Start & Restart */}
      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        {status === 'idle' && (
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 px-3 py-1 rounded-[3px] bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Start Test</span>
          </button>
        )}

        <button
          onClick={onRestart}
          aria-label="Restart typing test (Esc)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors text-xs ${
            isRunning
              ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
              : 'text-dark-muted hover:text-white'
          }`}
          title="Restart test (Esc)"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restart</span>
          <kbd className="hidden lg:inline text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-white/[0.06] text-dark-muted">
            Esc
          </kbd>
        </button>
      </div>
    </nav>
  );
};
