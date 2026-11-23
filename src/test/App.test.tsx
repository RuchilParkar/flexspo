import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from '../App';

describe('App Integration & User Interactions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders application header, title, and initial controls', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('flexspo');
    expect(screen.getByText(/Test your speed, unlock your flow/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /start test/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /restart/i })).toBeDefined();
  });

  it('allows switching difficulty levels before test begins', () => {
    render(<App />);

    const easyBtn = screen.getByRole('button', { name: /easy/i });
    const hardBtn = screen.getByRole('button', { name: /hard/i });
    const extremeBtn = screen.getByRole('button', { name: /extreme/i });

    expect(easyBtn).toBeDefined();
    expect(hardBtn).toBeDefined();
    expect(extremeBtn).toBeDefined();

    fireEvent.click(extremeBtn);
    expect(extremeBtn.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(hardBtn);
    expect(hardBtn.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(easyBtn);
    expect(easyBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('allows switching between Timed (60s) and Passage mode', () => {
    render(<App />);

    const timedBtn = screen.getByRole('button', { name: /timed \(60s\)/i });
    const passageBtn = screen.getByRole('button', { name: /passage/i });

    expect(timedBtn.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(passageBtn);
    expect(passageBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('starts test when clicking Start Test button', () => {
    render(<App />);

    const startBtn = screen.getByRole('button', { name: /start test/i });
    fireEvent.click(startBtn);

    // Prompt changes to active typing message
    expect(screen.getByText(/Typing in progress/i)).toBeDefined();
  });

  it('starts test when clicking the typing passage area', () => {
    render(<App />);

    const passageArea = screen.getByRole('textbox', { name: /typing passage area/i });
    fireEvent.click(passageArea);

    expect(screen.getByText(/Typing in progress/i)).toBeDefined();
  });

  it('opens and closes the keyboard shortcuts dialog', () => {
    render(<App />);

    const helpBtn = screen.getByRole('button', { name: /view keyboard shortcuts/i });
    fireEvent.click(helpBtn);

    expect(screen.getByText(/Keyboard Shortcuts/i)).toBeDefined();
    expect(screen.getByText(/Built for high-efficiency typists/i)).toBeDefined();

    const gotItBtn = screen.getByRole('button', { name: /got it/i });
    fireEvent.click(gotItBtn);

    expect(screen.queryByText(/Built for high-efficiency typists/i)).toBeNull();
  });

  it('toggles audio sound effects on and off', () => {
    render(<App />);

    const soundBtn = screen.getByRole('button', { name: /enable typing sounds/i });
    fireEvent.click(soundBtn);

    // Now sound is enabled
    expect(screen.getByRole('button', { name: /mute typing sounds/i })).toBeDefined();

    // Toggle back off
    const muteBtn = screen.getByRole('button', { name: /mute typing sounds/i });
    fireEvent.click(muteBtn);

    expect(screen.getByRole('button', { name: /enable typing sounds/i })).toBeDefined();
  });

  it('resets metrics and test state when Restart is clicked', () => {
    render(<App />);

    const startBtn = screen.getByRole('button', { name: /start test/i });
    fireEvent.click(startBtn);

    expect(screen.getByText(/Typing in progress/i)).toBeDefined();

    const restartBtn = screen.getByRole('button', { name: /restart/i });
    fireEvent.click(restartBtn);

    // Should return to idle start state
    expect(screen.getByRole('button', { name: /start test/i })).toBeDefined();
  });
});
