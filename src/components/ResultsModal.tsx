import React, { useEffect, useRef } from 'react';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { CompletionResult } from '../types';

interface ResultsModalProps {
  result: CompletionResult | null;
  onRetry: () => void;
  onClose: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({ result, onRetry, onClose }) => {
  const retryBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-focus retry button on open for instant keyboard replay
  useEffect(() => {
    if (result) {
      setTimeout(() => {
        retryBtnRef.current?.focus();
      }, 50);
    }
  }, [result]);

  if (!result) return null;

  const isSmashed = result.status === 'smashed';
  const isBaseline = result.status === 'baseline';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-xl bg-[#0c0e14] border border-white/[0.1] p-8 sm:p-10 shadow-2xl flex flex-col gap-8 text-left select-none">
        {/* Header Spec */}
        <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-dark-muted uppercase tracking-widest text-[11px]">
              Session Summary
            </span>
            <span
              className={`font-semibold ${
                isSmashed
                  ? 'text-amber-400'
                  : isBaseline
                  ? 'text-emerald-400'
                  : 'text-dark-muted'
              }`}
            >
              {isSmashed
                ? '★ Personal Best Smashed'
                : isBaseline
                ? 'Benchmark Established'
                : 'Session Complete'}
            </span>
          </div>

          <h2 id="results-title" className="text-2xl font-bold tracking-tight text-white mt-1">
            {result.title}
          </h2>

          <p className="text-xs text-dark-muted font-sans mt-0.5">
            {result.motivationalMessage}
          </p>
        </div>

        {/* Hero Readout: WPM and Accuracy Side-by-Side */}
        <div className="grid grid-cols-2 gap-8 font-mono border-b border-white/[0.06] pb-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-dark-muted font-sans font-medium mb-1">
              Speed
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl sm:text-7xl font-bold tracking-tight text-white tabular-nums">
                {result.wpm}
              </span>
              <span className="text-sm font-semibold text-dark-muted uppercase">
                WPM
              </span>
            </div>
            <div className="text-xs text-dark-muted mt-1">
              Tier: <span className="text-white font-medium">{result.tier}</span>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-dark-muted font-sans font-medium mb-1">
              Accuracy
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl sm:text-7xl font-bold tracking-tight text-amber-400 tabular-nums">
                {result.accuracy}
              </span>
              <span className="text-sm font-semibold text-dark-muted">
                %
              </span>
            </div>
            <div className="text-xs text-dark-muted mt-1">
              {result.previousBest !== null && (
                isSmashed ? (
                  <span className="text-amber-300">
                    +{(result.wpm - result.previousBest).toFixed(0)} WPM vs previous best
                  </span>
                ) : (
                  <span>Best: {result.bestWpm} WPM</span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Telemetry Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <div className="text-dark-faint text-[11px] uppercase tracking-wider mb-1 font-sans">
              Duration
            </div>
            <div className="text-lg font-bold text-white tabular-nums">
              {result.duration}s
            </div>
          </div>

          <div>
            <div className="text-dark-faint text-[11px] uppercase tracking-wider mb-1 font-sans">
              Correct
            </div>
            <div className="text-lg font-bold text-emerald-400 tabular-nums">
              {result.correctCharacters}
            </div>
          </div>

          <div>
            <div className="text-dark-faint text-[11px] uppercase tracking-wider mb-1 font-sans">
              Incorrect
            </div>
            <div className="text-lg font-bold text-rose-400 tabular-nums">
              {result.incorrectCharacters}
            </div>
          </div>

          <div>
            <div className="text-dark-faint text-[11px] uppercase tracking-wider mb-1 font-sans">
              Peak Streak
            </div>
            <div className="text-lg font-bold text-white tabular-nums">
              {result.streak}
            </div>
          </div>
        </div>

        {/* Secondary Info: Total Characters */}
        <div className="text-xs text-dark-faint font-mono flex items-center justify-between border-t border-white/[0.06] pt-4">
          <div>
            Total attempted characters: <strong className="text-white tabular-nums">{result.totalCharacters}</strong>
          </div>
          <div>
            Record status: <span className="text-dark-muted capitalize">{result.status}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            ref={retryBtnRef}
            onClick={onRetry}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs tracking-wide uppercase transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Play Again</span>
            <kbd className="hidden sm:inline ml-1 text-[10px] bg-black/15 px-1.5 py-0.5 rounded font-mono">
              Enter
            </kbd>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 border border-white/[0.1] hover:border-white/[0.2] text-dark-muted hover:text-white text-xs font-semibold tracking-wide uppercase transition-colors"
          >
            <span>Return to Test</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
