import React, { useEffect, useRef, useMemo } from 'react';
import { Passage, TestStatus } from '../types';

interface TypingAreaProps {
  passage: Passage;
  typed: string;
  status: TestStatus;
  progress: number;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocusInput: () => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  passage,
  typed,
  status,
  progress,
  inputRef,
  onKeyDown,
  onFocusInput,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);

  // Auto-scroll the active character into view smoothly
  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      const container = containerRef.current;
      const charEl = activeCharRef.current;

      const containerTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const charTop = charEl.offsetTop;
      const charHeight = charEl.clientHeight;

      if (charTop < containerTop || charTop + charHeight > containerTop + containerHeight) {
        container.scrollTo({
          top: charTop - containerHeight / 2 + charHeight / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [typed]);

  // Keep focus on window click or mount
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('select')) {
        return;
      }
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [inputRef]);

  const currentIndex = typed.length;

  // Tokenize passage into atomic words and whitespace tokens
  const tokens = useMemo(() => {
    const result: { type: 'word' | 'space'; chars: { char: string; index: number }[] }[] = [];
    let currentWord: { char: string; index: number }[] = [];

    for (let i = 0; i < passage.text.length; i++) {
      const char = passage.text[i];
      if (char === ' ' || char === '\t' || char === '\n') {
        if (currentWord.length > 0) {
          result.push({ type: 'word', chars: currentWord });
          currentWord = [];
        }
        result.push({ type: 'space', chars: [{ char, index: i }] });
      } else {
        currentWord.push({ char, index: i });
      }
    }
    if (currentWord.length > 0) {
      result.push({ type: 'word', chars: currentWord });
    }

    return result;
  }, [passage.text]);

  const wordCount = useMemo(() => {
    return passage.text.trim().split(/\s+/).length;
  }, [passage.text]);

  const renderChar = (char: string, index: number) => {
    const isTyped = index < currentIndex;
    const isCurrent = index === currentIndex;
    const isCorrect = isTyped && typed[index] === char;
    const isIncorrect = isTyped && !isCorrect;

    let charClass = '';

    if (isTyped) {
      if (isCorrect) {
        charClass = char === ' '
          ? 'text-emerald-400'
          : 'text-emerald-400 font-medium';
      } else {
        charClass = char === ' '
          ? 'text-rose-400 bg-rose-500/20 underline decoration-rose-500 decoration-1 underline-offset-4'
          : 'text-rose-400 bg-rose-500/20 underline decoration-rose-500 decoration-1 underline-offset-4 font-medium';
      }
    } else if (isCurrent) {
      charClass = 'text-white font-medium';
    } else {
      // Untyped text: cleanly readable slate for scanning ahead
      charClass = 'text-slate-500';
    }

    return (
      <span
        key={index}
        ref={isCurrent ? activeCharRef : null}
        className={`relative inline-block whitespace-pre font-mono ${charClass}`}
      >
        {/* Editorial Cursor Indicator */}
        {isCurrent && (
          <span
            className="absolute -left-[1.5px] top-[12%] bottom-[12%] w-[2px] bg-amber-400 animate-cursor-blink pointer-events-none z-10"
            aria-hidden="true"
          />
        )}
        {char}
      </span>
    );
  };

  return (
    <div className="w-full max-w-5xl lg:max-w-6xl mx-auto px-6 py-4 flex-1 flex flex-col justify-center">
      {/* Editorial Passage Canvas with Precision Corner Anchors */}
      <div
        role="textbox"
        aria-label="Typing passage area. Click to focus and start typing"
        tabIndex={0}
        onClick={onFocusInput}
        className="relative w-full p-6 sm:p-8 md:p-10 rounded-sm bg-[#0c0e14] border border-white/[0.08] cursor-text select-none flex flex-col"
      >
        {/* Precision Corner Anchors */}
        <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400/80 pointer-events-none" aria-hidden="true" />
        <div className="absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400/80 pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400/80 pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400/80 pointer-events-none" aria-hidden="true" />

        {/* Subtle Hairline Progress Indicator at Top of Canvas */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.04]"
          aria-hidden="true"
        >
          <div
            className="h-full bg-amber-400 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Canvas Top Corner Header: Metadata & Counter */}
        <div className="flex items-center justify-between text-xs font-mono text-dark-muted border-b border-white/[0.06] pb-3 mb-6 select-none">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
              {passage.difficulty}
            </span>
            <span className="text-white/80 font-medium">
              № {passage.id}
            </span>
            <span className="text-white/[0.15]">·</span>
            <span className="text-dark-muted font-sans text-xs truncate max-w-[200px] sm:max-w-sm">
              {passage.title}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            <span className="text-dark-muted tabular-nums">
              {typed.length} / {passage.text.length} chars
            </span>
            <span className="text-white/[0.15]">·</span>
            <span className="text-amber-400 font-semibold tabular-nums">
              {progress}%
            </span>
          </div>
        </div>

        {/* Hidden Input Field Capturing Keystrokes */}
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value=""
          onChange={() => {}}
          onKeyDown={onKeyDown}
          aria-label="Typing test input"
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
          className="absolute -top-40 left-0 opacity-0 pointer-events-none w-1 h-1 select-none"
        />

        {/* The Typographic Passage Centerpiece (No phantom scrollbar) */}
        <div
          ref={containerRef}
          className="overflow-y-auto max-h-[320px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden leading-[1.9] tracking-tight font-mono text-xl sm:text-2xl lg:text-[26px] text-left whitespace-pre-wrap break-words min-h-[140px]"
        >
          {tokens.map((token, tIdx) => {
            if (token.type === 'word') {
              return (
                <span key={`w-${tIdx}`} className="inline-block whitespace-nowrap">
                  {token.chars.map(({ char, index }) => renderChar(char, index))}
                </span>
              );
            }
            return token.chars.map(({ char, index }) => renderChar(char, index));
          })}
        </div>

        {/* Statusline & Key Cues */}
        <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-dark-muted">
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === 'running' ? 'bg-amber-400' : 'bg-dark-faint'
              }`}
            />
            <span className="text-dark-muted font-sans text-xs">
              {status === 'idle'
                ? 'Click anywhere or begin typing to start'
                : status === 'running'
                ? 'Typing in progress'
                : 'Test completed'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-dark-faint text-[11px]">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>Backspace to correct</span>
            <span>·</span>
            <span>Esc to restart</span>
          </div>
        </div>
      </div>
    </div>
  );
};
