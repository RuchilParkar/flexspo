import React, { useState } from 'react';
import { useTypingEngine } from './hooks/useTypingEngine';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { StatsPanel } from './components/StatsPanel';
import { StreakFeedback } from './components/StreakFeedback';
import { TypingArea } from './components/TypingArea';
import { ResultsModal } from './components/ResultsModal';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';

export const App: React.FC = () => {
  const {
    difficulty,
    mode,
    status,
    passage,
    typed,
    stats,
    personalBest,
    result,
    milestoneMessage,
    milestoneTriggerTime,
    wpmIncreased,
    inputRef,
    startTest,
    restartTest,
    handleSelectDifficulty,
    handleSelectMode,
    handleKeyDown,
    focusInput,
    closeResultModal,
  } = useTypingEngine();

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#090a0f] text-[#f8fafc]">
      { }

      <div className="fixed top-4 right-5 text-[10px] font-mono text-white/20 hidden xl:flex items-center gap-2 select-none pointer-events-none">
        <span></span>
        <span> 5 CPM SCALE</span>
      </div>
      <div className="fixed bottom-4 left-5 text-[10px] font-mono text-white/20 hidden xl:flex items-center gap-2 select-none pointer-events-none">
        <span>MONOSPACE CANVAS</span>
      </div>
      <div className="fixed bottom-4 right-5 text-[10px] font-mono text-white/20 hidden xl:flex items-center gap-2 select-none pointer-events-none">
        <span>ESC: INSTANT RESET</span>
      </div>

      {/* Top Section: Header & Command Bar */}
      <div className="w-full">
        <Header personalBest={personalBest} onOpenHelp={() => setIsHelpOpen(true)} />
        <Controls
          difficulty={difficulty}
          mode={mode}
          status={status}
          onSelectDifficulty={handleSelectDifficulty}
          onSelectMode={handleSelectMode}
          onStart={startTest}
          onRestart={restartTest}
        />
      </div>

      {/* Center Section: Telemetry & Typographic Canvas */}
      <main className="w-full flex-1 flex flex-col justify-center py-2">
        <StatsPanel stats={stats} mode={mode} wpmIncreased={wpmIncreased} />
        <StreakFeedback
          streak={stats.streak}
          milestoneMessage={milestoneMessage}
          milestoneTriggerTime={milestoneTriggerTime}
        />
        <TypingArea
          passage={passage}
          typed={typed}
          status={status}
          progress={stats.progress}
          inputRef={inputRef}
          onKeyDown={handleKeyDown}
          onFocusInput={focusInput}
        />
      </main>

      {/* Bottom Section: Quiet Editorial Footer */}
      <footer className="w-full max-w-5xl lg:max-w-6xl mx-auto px-6 py-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-dark-faint">
        <div className="flex items-center gap-3">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-dark-muted text-[10px]">
            Esc
          </kbd>
          <span>to restart</span>
        </div>
      </footer>

      {/* Results Performance Sheet */}
      <ResultsModal
        result={result}
        onRetry={restartTest}
        onClose={closeResultModal}
      />

      {/* Keyboard Shortcuts Cheatsheet */}
      <KeyboardShortcutsHelp
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;
