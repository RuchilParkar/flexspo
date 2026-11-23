export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export type TestMode = 'timed' | 'passage';

export type TestStatus = 'idle' | 'running' | 'completed';

export interface Passage {
  id: number;
  difficulty: Difficulty;
  title?: string;
  text: string;
}

export interface TypingStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  charactersTyped: number;
  correctCharacters: number;
  incorrectCharacters: number;
  cumulativeErrors: number;
  timeElapsed: number;
  timeRemaining: number;
  streak: number;
  maxStreak: number;
  progress: number;
}

export interface PersonalBestRecord {
  bestWpm: number;
  accuracy: number;
  date: string;
  difficulty: Difficulty;
  mode: TestMode;
}

export type PersonalBestStatus = 'baseline' | 'smashed' | 'normal';

export interface CompletionResult {
  wpm: number;
  accuracy: number;
  correctCharacters: number;
  incorrectCharacters: number;
  totalCharacters: number;
  duration: number;
  status: PersonalBestStatus;
  previousBest: number | null;
  bestWpm: number;
  title: string;
  motivationalMessage: string;
  tier: string;
  streak: number;
}
