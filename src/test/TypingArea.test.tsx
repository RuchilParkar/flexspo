import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { TypingArea } from '../components/TypingArea';
import { Passage } from '../types';

describe('TypingArea Spacing & Character Rendering', () => {
  const samplePassage: Passage = {
    id: 99,
    difficulty: 'medium',
    title: 'Spacing Test',
    text: 'The quick brown fox.  It jumps over the lazy dog!',
  };

  const dummyRef = { current: null };

  it('preserves all whitespace and space characters between words', () => {
    const { container } = render(
      <TypingArea
        passage={samplePassage}
        typed=""
        status="idle"
        progress={0}
        inputRef={dummyRef}
        onKeyDown={() => {}}
        onFocusInput={() => {}}
      />
    );

    // Look for space spans with whitespace-pre
    const spaceSpans = container.querySelectorAll('.whitespace-pre');
    expect(spaceSpans.length).toBe(samplePassage.text.length);

    // Verify all text in the passage container matches original text including spaces
    const passageContainer = container.querySelector('.whitespace-pre-wrap');
    expect(passageContainer).toBeDefined();
    expect(passageContainer?.textContent).toBe(samplePassage.text);
  });

  it('keeps words in atomic whitespace-nowrap wrappers preventing mid-word breaks', () => {
    const { container } = render(
      <TypingArea
        passage={samplePassage}
        typed=""
        status="idle"
        progress={0}
        inputRef={dummyRef}
        onKeyDown={() => {}}
        onFocusInput={() => {}}
      />
    );

    const wordWrappers = container.querySelectorAll('.whitespace-nowrap');
    // "The", "quick", "brown", "fox.", "It", "jumps", "over", "the", "lazy", "dog!"
    expect(wordWrappers.length).toBe(10);
  });

  it('highlights spaces correctly when typed correctly', () => {
    // "The " (4 chars: T, h, e, ' ')
    const { container } = render(
      <TypingArea
        passage={samplePassage}
        typed="The "
        status="running"
        progress={10}
        inputRef={dummyRef}
        onKeyDown={() => {}}
        onFocusInput={() => {}}
      />
    );

    // Index 3 is the space after "The"
    const chars = container.querySelectorAll('.font-mono.whitespace-pre');
    const spaceChar = chars[3];
    expect(spaceChar.textContent).toBe(' ');
    expect(spaceChar.className).toContain('text-emerald-400');
    expect(spaceChar.className).toContain('font-mono');
  });

  it('highlights spaces with distinctive error styling when typed incorrectly', () => {
    // Expected ' ' at index 3, but user typed 'x'
    const { container } = render(
      <TypingArea
        passage={samplePassage}
        typed="Thex"
        status="running"
        progress={10}
        inputRef={dummyRef}
        onKeyDown={() => {}}
        onFocusInput={() => {}}
      />
    );

    const chars = container.querySelectorAll('.font-mono.whitespace-pre');
    const spaceChar = chars[3];
    expect(spaceChar.textContent).toBe(' ');
    expect(spaceChar.className).toContain('text-rose-400');
    expect(spaceChar.className).toContain('underline');
    expect(spaceChar.className).toContain('font-mono');
  });

  it('preserves multiple consecutive spaces between sentences', () => {
    // samplePassage has "fox.  It" (two spaces after the period)
    const { container } = render(
      <TypingArea
        passage={samplePassage}
        typed=""
        status="idle"
        progress={0}
        inputRef={dummyRef}
        onKeyDown={() => {}}
        onFocusInput={() => {}}
      />
    );

    const passageContainer = container.querySelector('.whitespace-pre-wrap');
    expect(passageContainer?.textContent).toContain('.  It');

    // Both spaces have their own individual spans at indices 20 and 21
    const chars = container.querySelectorAll('.font-mono.whitespace-pre');
    expect(chars[20].textContent).toBe(' ');
    expect(chars[21].textContent).toBe(' ');
  });
});
