import { PersonalBestRecord, PersonalBestStatus, Difficulty, TestMode } from '../types';

const STORAGE_KEY_BEST = 'flexspo_personal_best';
const STORAGE_KEY_HISTORY = 'flexspo_test_history';

export class StorageService {
  public static getPersonalBest(): PersonalBestRecord | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_BEST);
      if (!data) return null;
      return JSON.parse(data) as PersonalBestRecord;
    } catch {
      return null;
    }
  }

  public static recordTestResult(
    wpm: number,
    accuracy: number,
    difficulty: Difficulty,
    mode: TestMode
  ): {
    status: PersonalBestStatus;
    previousBest: number | null;
    bestWpm: number;
  } {
    const previous = this.getPersonalBest();
    const currentDate = new Date().toISOString();

    if (!previous) {
      // First test ever: Baseline Established!
      const newRecord: PersonalBestRecord = {
        bestWpm: wpm,
        accuracy,
        date: currentDate,
        difficulty,
        mode,
      };
      this.savePersonalBest(newRecord);
      this.appendHistory(newRecord);
      return {
        status: 'baseline',
        previousBest: null,
        bestWpm: wpm,
      };
    }

    if (wpm > previous.bestWpm) {
      // High Score Smashed!
      const newRecord: PersonalBestRecord = {
        bestWpm: wpm,
        accuracy,
        date: currentDate,
        difficulty,
        mode,
      };
      this.savePersonalBest(newRecord);
      this.appendHistory(newRecord);
      return {
        status: 'smashed',
        previousBest: previous.bestWpm,
        bestWpm: wpm,
      };
    }

    // Did not beat personal best
    this.appendHistory({
      bestWpm: wpm,
      accuracy,
      date: currentDate,
      difficulty,
      mode,
    });
    return {
      status: 'normal',
      previousBest: previous.bestWpm,
      bestWpm: previous.bestWpm,
    };
  }

  private static savePersonalBest(record: PersonalBestRecord): void {
    try {
      localStorage.setItem(STORAGE_KEY_BEST, JSON.stringify(record));
    } catch (e) {
      console.error('Failed to save personal best to localStorage', e);
    }
  }

  private static appendHistory(record: PersonalBestRecord): void {
    try {
      const existing = localStorage.getItem(STORAGE_KEY_HISTORY);
      const history: PersonalBestRecord[] = existing ? JSON.parse(existing) : [];
      history.push(record);
      // Keep last 50 tests
      if (history.length > 50) history.shift();
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }

  public static clearPersonalBest(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_BEST);
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch {
      // ignore
    }
  }
}
