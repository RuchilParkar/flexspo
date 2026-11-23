import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Difficulty,
  TestMode,
  TestStatus,
  Passage,
  TypingStats,
  CompletionResult,
  PersonalBestRecord,
} from '../types';
import { PassageService } from '../services/passageService';
import { StorageService } from '../services/storage';
import { soundService } from '../services/sound';

export function useTypingEngine() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [mode, setMode] = useState<TestMode>('timed');
  const [status, setStatus] = useState<TestStatus>('idle');
  const [passage, setPassage] = useState<Passage>(() =>
    PassageService.getRandomPassage('medium')
  );

  // Typing state
  const [typed, setTyped] = useState<string>('');
  const [cumulativeMistakes, setCumulativeMistakes] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [milestoneMessage, setMilestoneMessage] = useState<string>('');
  const [milestoneTriggerTime, setMilestoneTriggerTime] = useState<number>(0);
  const [wpmIncreased, setWpmIncreased] = useState<boolean>(false);

  // Time tracking
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [personalBest, setPersonalBest] = useState<PersonalBestRecord | null>(() =>
    StorageService.getPersonalBest()
  );
  const [result, setResult] = useState<CompletionResult | null>(null);

  // Refs for state accessible in animation/intervals without stale closures
  const startTimeRef = useRef<number | null>(null);
  const timerFrameRef = useRef<number | null>(null);
  const prevWpmRef = useRef<number>(0);
  const hasEndedRef = useRef<boolean>(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Load passages on mount
  useEffect(() => {
    PassageService.loadPassages().then(() => {
      // Refresh passage from local data.json if needed
      setPassage(PassageService.getRandomPassage(difficulty));
    });
  }, []);

  // Update personal best state on mount or change
  const refreshPersonalBest = useCallback(() => {
    setPersonalBest(StorageService.getPersonalBest());
  }, []);

  // Compute live character correctness
  const passageChars = passage.text;
  let correctCount = 0;
  let currentIncorrectCount = 0;

  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === passageChars[i]) {
      correctCount++;
    } else {
      currentIncorrectCount++;
    }
  }

  // Calculate live WPM: (correctCharacters / 5) / (minutes)
  const elapsedMinutes = timeElapsed > 0 ? timeElapsed / 60 : 0;
  const liveWpm =
    timeElapsed >= 1 && elapsedMinutes > 0
      ? Math.round((correctCount / 5) / elapsedMinutes)
      : 0;

  // Raw WPM: (total typed / 5) / minutes
  const rawWpm =
    timeElapsed >= 1 && elapsedMinutes > 0
      ? Math.round((typed.length / 5) / elapsedMinutes)
      : 0;

  // Cumulative Accuracy: correct / (correct + cumulativeMistakes)
  const totalAttempted = correctCount + cumulativeMistakes;
  const liveAccuracy =
    totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 100;

  // Time remaining for timed mode
  const timeRemaining = mode === 'timed' ? Math.max(0, 60 - Math.floor(timeElapsed)) : 0;
  const progressPercent =
    passageChars.length > 0
      ? Math.min(100, Math.round((typed.length / passageChars.length) * 100))
      : 0;

  // Detect WPM surge for subtle animation
  useEffect(() => {
    if (status === 'running' && liveWpm > prevWpmRef.current && liveWpm > 20) {
      setWpmIncreased(true);
      const t = setTimeout(() => setWpmIncreased(false), 800);
      prevWpmRef.current = liveWpm;
      return () => clearTimeout(t);
    }
    prevWpmRef.current = liveWpm;
  }, [liveWpm, status]);

  // Determine benchmark tier
  const getSpeedTier = (wpm: number): string => {
    if (wpm >= 110) return 'Elite (110+ WPM)';
    if (wpm >= 90) return 'Master (90-109 WPM)';
    if (wpm >= 70) return 'Advanced (70-89 WPM)';
    if (wpm >= 50) return 'Intermediate (50-69 WPM)';
    if (wpm >= 30) return 'Developing (30-49 WPM)';
    return 'Novice (<30 WPM)';
  };

  // Trigger celebration confetti
  const launchCelebrationConfetti = useCallback(() => {
    try {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#6366f1', '#a855f7', '#06b6d4'],
      });
      fire(0.2, {
        spread: 60,
        colors: ['#10b981', '#f59e0b', '#ec4899'],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        colors: ['#6366f1', '#3b82f6', '#14b8a6'],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    } catch {
      // Fallback if confetti is blocked
    }
  }, []);

  // Complete test function
  const endTest = useCallback(
    (forcedFinalTime?: number) => {
      if (hasEndedRef.current) return;
      hasEndedRef.current = true;

      if (timerFrameRef.current) {
        cancelAnimationFrame(timerFrameRef.current);
        timerFrameRef.current = null;
      }

      setStatus('completed');

      const finalElapsed = Math.max(
        1,
        forcedFinalTime !== undefined ? forcedFinalTime : timeElapsed
      );
      const finalMinutes = finalElapsed / 60;

      // Final correct & errors
      let finalCorrect = 0;
      let finalCurrentErrors = 0;
      for (let i = 0; i < typed.length; i++) {
        if (typed[i] === passage.text[i]) {
          finalCorrect++;
        } else {
          finalCurrentErrors++;
        }
      }

      const finalWpm = Math.round((finalCorrect / 5) / finalMinutes);
      const finalTotalAttempts = finalCorrect + cumulativeMistakes;
      const finalAccuracy =
        finalTotalAttempts > 0
          ? Math.round((finalCorrect / finalTotalAttempts) * 100)
          : 100;

      // Persist & check high score
      const recordResult = StorageService.recordTestResult(
        finalWpm,
        finalAccuracy,
        difficulty,
        mode
      );

      refreshPersonalBest();

      let title = 'Test Complete';
      let motivational = 'Great effort. Consistent practice sharpens speed and accuracy.';

      if (recordResult.status === 'baseline') {
        title = 'Baseline Recorded';
        motivational =
          'Initial benchmark established. Continue practicing to measure your progress.';
        soundService.playStreakMilestone();
      } else if (recordResult.status === 'smashed') {
        title = 'High Score Smashed!';
        motivational =
          'Incredible run! You achieved a new personal best.';
        launchCelebrationConfetti();
        soundService.playCelebration();
      } else {
        // Normal completion
        if (finalAccuracy >= 98) {
          motivational = 'Excellent accuracy maintained throughout the passage.';
        } else if (finalWpm >= 70) {
          motivational = 'Strong speed. Focus on precision to push even higher.';
        }
        soundService.playStreakMilestone();
      }

      const finalResult: CompletionResult = {
        wpm: finalWpm,
        accuracy: finalAccuracy,
        correctCharacters: finalCorrect,
        incorrectCharacters: cumulativeMistakes + finalCurrentErrors,
        totalCharacters: finalTotalAttempts,
        duration: Math.round(finalElapsed),
        status: recordResult.status,
        previousBest: recordResult.previousBest,
        bestWpm: recordResult.bestWpm,
        title,
        motivationalMessage: motivational,
        tier: getSpeedTier(finalWpm),
        streak: maxStreak,
      };

      setResult(finalResult);
    },
    [
      timeElapsed,
      typed,
      passage.text,
      cumulativeMistakes,
      difficulty,
      mode,
      maxStreak,
      launchCelebrationConfetti,
      refreshPersonalBest,
    ]
  );

  // Accurate timer loop using performance.now()
  useEffect(() => {
    if (status !== 'running') return;

    const tick = () => {
      if (startTimeRef.current === null) return;
      const now = performance.now();
      const elapsedSec = (now - startTimeRef.current) / 1000;

      if (mode === 'timed') {
        if (elapsedSec >= 60) {
          setTimeElapsed(60);
          endTest(60);
          return;
        } else {
          setTimeElapsed(elapsedSec);
        }
      } else {
        // Passage mode (counts upward)
        setTimeElapsed(elapsedSec);
      }

      timerFrameRef.current = requestAnimationFrame(tick);
    };

    timerFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerFrameRef.current) {
        cancelAnimationFrame(timerFrameRef.current);
      }
    };
  }, [status, mode, endTest]);

  // Start test explicitly or on first keystroke
  const startTest = useCallback(() => {
    if (status === 'running') return;

    hasEndedRef.current = false;
    setStatus('running');
    startTimeRef.current = performance.now();
    setTimeElapsed(0);

    // Focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [status]);

  // Restart test: resets timer, metrics, progress, errors, and selects a new passage
  const restartTest = useCallback(() => {
    if (timerFrameRef.current) {
      cancelAnimationFrame(timerFrameRef.current);
      timerFrameRef.current = null;
    }

    hasEndedRef.current = false;
    startTimeRef.current = null;
    setStatus('idle');
    setTyped('');
    setCumulativeMistakes(0);
    setCurrentStreak(0);
    setMaxStreak(0);
    setTimeElapsed(0);
    setMilestoneMessage('');
    setResult(null);
    prevWpmRef.current = 0;

    // Pick a new random passage of the current difficulty
    const nextPassage = PassageService.getRandomPassage(difficulty, passage.id);
    setPassage(nextPassage);

    // Keep input focused
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 50);
  }, [difficulty, passage.id]);

  // Handle switching difficulty (allowed when idle or triggers clean restart)
  const handleSelectDifficulty = useCallback(
    (newDiff: Difficulty) => {
      if (newDiff === difficulty && status === 'idle') return;
      setDifficulty(newDiff);

      if (timerFrameRef.current) {
        cancelAnimationFrame(timerFrameRef.current);
        timerFrameRef.current = null;
      }

      hasEndedRef.current = false;
      startTimeRef.current = null;
      setStatus('idle');
      setTyped('');
      setCumulativeMistakes(0);
      setCurrentStreak(0);
      setMaxStreak(0);
      setTimeElapsed(0);
      setMilestoneMessage('');
      setResult(null);
      prevWpmRef.current = 0;

      const nextPassage = PassageService.getRandomPassage(newDiff);
      setPassage(nextPassage);
    },
    [difficulty, status]
  );

  // Handle switching mode (allowed when idle)
  const handleSelectMode = useCallback(
    (newMode: TestMode) => {
      if (status === 'running') return; // Prevent switching during active test
      setMode(newMode);
      restartTest();
    },
    [status, restartTest]
  );

  // Check milestones and trigger motivational cues
  const checkMilestones = useCallback((streak: number, wpm: number, accuracy: number) => {
    let msg = '';
    if (streak === 10) msg = 'Good rhythm';
    else if (streak === 25) msg = '25 streak';
    else if (streak === 50) msg = '50 streak';
    else if (streak === 75) msg = '75 streak';
    else if (wpm >= 85 && streak > 15) msg = 'High velocity';
    else if (accuracy >= 98 && streak >= 30) msg = 'High precision';

    if (msg) {
      setMilestoneMessage(msg);
      setMilestoneTriggerTime(Date.now());
      soundService.playStreakMilestone();
    }
  }, []);

  // Process keystrokes
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (status === 'completed') return;

      // Special hotkeys: Tab + Enter or Escape to restart
      if (e.key === 'Escape') {
        e.preventDefault();
        restartTest();
        return;
      }

      // Ignore modifier keys by themselves
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
        return;
      }

      // Start on first keypress if still idle
      if (status === 'idle') {
        startTest();
      }

      // Handle Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (typed.length > 0) {
          setTyped((prev) => prev.slice(0, -1));
          soundService.playKeyPress();
        }
        return;
      }

      // Allow only printable characters (single characters)
      if (e.key.length !== 1) {
        return;
      }

      e.preventDefault();

      // Check if we reached the passage end
      if (typed.length >= passage.text.length) {
        return;
      }

      const expectedChar = passage.text[typed.length];
      const typedChar = e.key;
      const isCorrect = typedChar === expectedChar;

      if (isCorrect) {
        soundService.playKeyPress();
        const nextStreak = currentStreak + 1;
        setCurrentStreak(nextStreak);
        setMaxStreak((prev) => Math.max(prev, nextStreak));
        checkMilestones(nextStreak, liveWpm, liveAccuracy);
      } else {
        soundService.playKeyError();
        // Track mistake cumulatively
        setCumulativeMistakes((prev) => prev + 1);
        // Reset streak on error
        setCurrentStreak(0);
      }

      const nextTyped = typed + typedChar;
      setTyped(nextTyped);

      // Check if this keystroke completed the passage
      if (nextTyped.length === passage.text.length) {
        // Completed entire passage!
        endTest();
      }
    },
    [
      status,
      typed,
      passage.text,
      currentStreak,
      liveWpm,
      liveAccuracy,
      startTest,
      restartTest,
      endTest,
      checkMilestones,
    ]
  );

  // Keep input focused when clicking the passage or anywhere in the typing area
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (status === 'idle') {
      startTest();
    }
  }, [status, startTest]);

  const stats: TypingStats = {
    wpm: liveWpm,
    rawWpm,
    accuracy: liveAccuracy,
    charactersTyped: totalAttempted,
    correctCharacters: correctCount,
    incorrectCharacters: currentIncorrectCount,
    cumulativeErrors: cumulativeMistakes,
    timeElapsed: Math.round(timeElapsed),
    timeRemaining,
    streak: currentStreak,
    maxStreak,
    progress: progressPercent,
  };

  return {
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
    closeResultModal: () => setResult(null),
    refreshPersonalBest,
  };
}
