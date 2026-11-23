import React from 'react';
import { TypingStats, TestMode } from '../types';

interface StatsPanelProps {
  stats: TypingStats;
  mode: TestMode;
  wpmIncreased: boolean;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, mode }) => {
  const formatTime = () => {
    if (mode === 'timed') {
      return `${stats.timeRemaining}s`;
    }
    const mins = Math.floor(stats.timeElapsed / 60);
    const secs = stats.timeElapsed % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <section
      role="region"
      aria-label="Live Typing Metrics"
      className="w-full max-w-5xl lg:max-w-6xl mx-auto px-6 pt-4 pb-2"
    >
      {/* Unified Editorial Telemetry Strip */}
      <div className="flex flex-wrap items-baseline justify-between gap-6 py-3 px-4 border-y border-white/[0.06] font-mono select-none">
        {/* Metric 1: WPM */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-widest text-dark-muted font-sans font-medium">
            WPM
          </span>
          <span className="text-3xl font-bold tracking-tight text-white tabular-nums">
            {stats.wpm}
          </span>
        </div>

        {/* Metric 2: Accuracy */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-widest text-dark-muted font-sans font-medium">
            Accuracy
          </span>
          <span className="text-3xl font-bold tracking-tight text-white tabular-nums">
            {stats.accuracy}
            <span className="text-base font-normal text-dark-muted">%</span>
          </span>
        </div>

        {/* Metric 3: Time Remaining / Elapsed */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-widest text-dark-muted font-sans font-medium">
            {mode === 'timed' ? 'Time remaining' : 'Time elapsed'}
          </span>
          <span className="text-3xl font-bold tracking-tight text-white tabular-nums">
            {formatTime()}
          </span>
        </div>

        {/* Metric 4: Streak */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-widest text-dark-muted font-sans font-medium">
            Streak
          </span>
          <span className="text-3xl font-bold tracking-tight text-white tabular-nums">
            {stats.streak}
          </span>
          {stats.maxStreak > 0 && (
            <span className="text-xs text-dark-muted tabular-nums">
              (max {stats.maxStreak})
            </span>
          )}
        </div>

        {/* Metric 5: Characters Breakdown */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-dark-muted font-sans">Correct</span>
            <span className="text-emerald-400 font-semibold tabular-nums">
              {stats.correctCharacters}
            </span>
          </div>
          <span className="text-white/[0.12]" aria-hidden="true">/</span>
          <div className="flex items-center gap-1.5">
            <span className="text-dark-muted font-sans">Errors</span>
            <span className="text-rose-400 font-semibold tabular-nums">
              {stats.cumulativeErrors}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
