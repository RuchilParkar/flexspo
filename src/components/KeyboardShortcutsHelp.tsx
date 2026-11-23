import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Typing', desc: 'Starts the test on first keystroke' },
    { key: 'Backspace', desc: 'Deletes incorrect characters' },
    { key: 'Escape', desc: 'Instantly restarts test with a fresh passage' },
    { key: 'Enter / Space', desc: 'Confirms "Play Again" on results sheet' },
    { key: 'Click Passage', desc: 'Directs focus to the input' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#0c0e14] border border-white/[0.1] p-6 sm:p-7 shadow-2xl flex flex-col gap-6 text-left select-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-[1px] bg-amber-400" aria-hidden="true" />
            <h3 id="shortcuts-title" className="text-base font-bold font-mono text-white">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts modal"
            className="p-1 text-dark-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcut List */}
        <div className="flex flex-col gap-3 font-mono text-xs">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 border-b border-white/[0.03]">
              <span className="text-dark-muted font-sans">{s.desc}</span>
              <kbd className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-amber-400 border border-white/[0.08]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between text-xs text-dark-faint border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5 font-sans">
            <Command className="w-3.5 h-3.5 text-dark-muted" />
            <span>Built for high-efficiency typists</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.14] text-white font-mono text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
