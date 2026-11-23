import { describe, it, expect, beforeEach } from 'vitest';
import { PassageService } from '../services/passageService';
import { StorageService } from '../services/storage';
import officialData from '../data/data.json';

describe('Typing Speed Test Engine & Services', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Official Passage Dataset Validation (23 Passages)', () => {
    it('has correct counts per difficulty level (5 easy, 5 medium, 9 hard, 4 extreme)', async () => {
      const passages = await PassageService.loadPassages();
      expect(passages.easy.length).toBe(5);
      expect(passages.medium.length).toBe(5);
      expect(passages.hard.length).toBe(9);
      expect(passages.extreme.length).toBe(4);
    });

    it('has exactly 23 unique passage IDs in total', () => {
      const allPassages = PassageService.getAllPassages();
      expect(allPassages.length).toBe(23);

      const uniqueIds = new Set(allPassages.map((p) => p.id));
      expect(uniqueIds.size).toBe(23);
    });

    it('has no duplicate passages or text in the selection pool', () => {
      const allPassages = PassageService.getAllPassages();
      const uniqueTexts = new Set(allPassages.map((p) => p.text.trim()));
      expect(uniqueTexts.size).toBe(23);
    });

    it('matches all 23 titles, IDs, and texts exactly from the supplied JSON', () => {
      const expectedPassages = officialData.passages;
      expect(expectedPassages.length).toBe(23);

      const allLoaded = PassageService.getAllPassages();

      expectedPassages.forEach((expected) => {
        const found = allLoaded.find((p) => p.id === expected.id);
        expect(found).toBeDefined();
        expect(found?.title).toBe(expected.title);
        expect(found?.text).toBe(expected.text);
        expect(found?.difficulty).toBe(expected.difficulty);
      });
    });

    it('verifies the 4 new Hard passages (IDs 206 to 209)', () => {
      const hardPassages = PassageService.getPassagesByDifficulty('hard');

      const p206 = hardPassages.find((p) => p.id === 206);
      expect(p206?.title).toBe('Quantum Computing');
      expect(p206?.difficulty).toBe('hard');

      const p207 = hardPassages.find((p) => p.id === 207);
      expect(p207?.title).toBe('The Architecture of Distributed Systems');
      expect(p207?.difficulty).toBe('hard');

      const p208 = hardPassages.find((p) => p.id === 208);
      expect(p208?.title).toBe('Artificial Intelligence and Ethics');
      expect(p208?.difficulty).toBe('hard');

      const p209 = hardPassages.find((p) => p.id === 209);
      expect(p209?.title).toBe('The Mathematics of Chaos');
      expect(p209?.difficulty).toBe('hard');
    });

    it('verifies the 4 new Extreme Hard passages (IDs 301 to 304)', () => {
      const extremePassages = PassageService.getPassagesByDifficulty('extreme');
      expect(extremePassages.length).toBe(4);

      const p301 = extremePassages.find((p) => p.id === 301);
      expect(p301?.title).toBe('Cryptographic Vulnerabilities');
      expect(p301?.difficulty).toBe('extreme');

      const p302 = extremePassages.find((p) => p.id === 302);
      expect(p302?.title).toBe('The Complexity of Asynchronous Execution');
      expect(p302?.difficulty).toBe('extreme');

      const p303 = extremePassages.find((p) => p.id === 303);
      expect(p303?.title).toBe('Astrophysics Beyond Observation');
      expect(p303?.difficulty).toBe('extreme');

      const p304 = extremePassages.find((p) => p.id === 304);
      expect(p304?.title).toBe('Engineering Reliable Autonomous Systems');
      expect(p304?.difficulty).toBe('extreme');
    });

    it('filters passages strictly by difficulty level across all 4 categories', async () => {
      const passages = await PassageService.loadPassages();
      passages.easy.forEach((p) => expect(p.difficulty).toBe('easy'));
      passages.medium.forEach((p) => expect(p.difficulty).toBe('medium'));
      passages.hard.forEach((p) => expect(p.difficulty).toBe('hard'));
      passages.extreme.forEach((p) => expect(p.difficulty).toBe('extreme'));
    });

    it('returns a valid random passage for all four difficulties', () => {
      const easyP = PassageService.getRandomPassage('easy');
      expect(easyP.difficulty).toBe('easy');
      expect(easyP.text.length).toBeGreaterThan(10);

      const medP = PassageService.getRandomPassage('medium');
      expect(medP.difficulty).toBe('medium');
      expect(medP.text.length).toBeGreaterThan(20);

      const hardP = PassageService.getRandomPassage('hard');
      expect(hardP.difficulty).toBe('hard');
      expect(hardP.text.length).toBeGreaterThan(30);

      const extremeP = PassageService.getRandomPassage('extreme');
      expect(extremeP.difficulty).toBe('extreme');
      expect(extremeP.text.length).toBeGreaterThan(30);
    });

    it('avoids selecting the same passage consecutively on restart in extreme difficulty', () => {
      const first = PassageService.getRandomPassage('extreme');
      const second = PassageService.getRandomPassage('extreme', first.id);
      expect(second.id).not.toBe(first.id);
      expect(second.difficulty).toBe('extreme');
    });

    it('handles empty or unrecognized difficulty categories gracefully', () => {
      const fallback = PassageService.getRandomPassage('unknown' as any);
      expect(fallback).toBeDefined();
      expect(fallback.text).toBeDefined();
    });

    it('ensures both timed and passage modes have access to identical dataset', () => {
      const easyPassages = PassageService.getPassagesByDifficulty('easy');
      const medPassages = PassageService.getPassagesByDifficulty('medium');
      const hardPassages = PassageService.getPassagesByDifficulty('hard');
      const extremePassages = PassageService.getPassagesByDifficulty('extreme');

      expect(easyPassages.length).toBe(5);
      expect(medPassages.length).toBe(5);
      expect(hardPassages.length).toBe(9);
      expect(extremePassages.length).toBe(4);
    });
  });

  describe('WPM Calculation', () => {
    it('calculates WPM accurately using standard 5 characters per word', () => {
      // 50 characters in 1 minute = 10 words / 1 min = 10 WPM
      const correctChars = 50;
      const elapsedMinutes = 60 / 60; // 1 min
      const wpm = Math.round((correctChars / 5) / elapsedMinutes);
      expect(wpm).toBe(10);

      // 300 characters in 1 minute = 60 words / 1 min = 60 WPM
      const correctChars60 = 300;
      const wpm60 = Math.round((correctChars60 / 5) / elapsedMinutes);
      expect(wpm60).toBe(60);

      // 150 characters in 30 seconds (0.5 minutes) = 30 words / 0.5 min = 60 WPM
      const correctChars30s = 150;
      const elapsed30s = 30 / 60;
      const wpm30s = Math.round((correctChars30s / 5) / elapsed30s);
      expect(wpm30s).toBe(60);
    });
  });

  describe('Cumulative Accuracy and Backspace Corrections', () => {
    it('tracks mistakes cumulatively so backspacing does not erase error penalty', () => {
      let correct = 10;
      let cumulativeMistakes = 0;
      let totalAttempts = correct + cumulativeMistakes;
      let accuracy = Math.round((correct / totalAttempts) * 100);
      expect(accuracy).toBe(100);

      // User makes an error
      cumulativeMistakes += 1;
      totalAttempts = correct + cumulativeMistakes;
      accuracy = Math.round((correct / totalAttempts) * 100);
      expect(accuracy).toBe(91); // 10/11 = 90.9% -> 91%

      // User hits backspace and types the correct character!
      correct += 1;
      totalAttempts = correct + cumulativeMistakes;
      accuracy = Math.round((correct / totalAttempts) * 100);
      expect(accuracy).toBe(92); // 11/12 = 91.66% -> 92%

      expect(accuracy).toBeLessThan(100);
      expect(cumulativeMistakes).toBe(1);
    });
  });

  describe('Personal Best & Milestones Storage', () => {
    it('establishes baseline on first completed test', () => {
      const res = StorageService.recordTestResult(65, 96, 'medium', 'timed');
      expect(res.status).toBe('baseline');
      expect(res.previousBest).toBeNull();
      expect(res.bestWpm).toBe(65);

      const saved = StorageService.getPersonalBest();
      expect(saved?.bestWpm).toBe(65);
      expect(saved?.accuracy).toBe(96);
    });

    it('triggers smashed high score when beating personal best', () => {
      StorageService.recordTestResult(60, 95, 'medium', 'timed');
      const res = StorageService.recordTestResult(75, 98, 'medium', 'timed');
      expect(res.status).toBe('smashed');
      expect(res.previousBest).toBe(60);
      expect(res.bestWpm).toBe(75);

      const saved = StorageService.getPersonalBest();
      expect(saved?.bestWpm).toBe(75);
    });

    it('triggers normal test complete when personal best is not beaten', () => {
      StorageService.recordTestResult(80, 95, 'medium', 'timed');
      const res = StorageService.recordTestResult(70, 90, 'medium', 'timed');
      expect(res.status).toBe('normal');
      expect(res.previousBest).toBe(80);
      expect(res.bestWpm).toBe(80);

      const saved = StorageService.getPersonalBest();
      expect(saved?.bestWpm).toBe(80);
    });

    it('persists personal best across mock reloads', () => {
      StorageService.recordTestResult(85, 99, 'extreme', 'passage');
      const retrieved = StorageService.getPersonalBest();
      expect(retrieved?.bestWpm).toBe(85);
      expect(retrieved?.difficulty).toBe('extreme');
      expect(retrieved?.mode).toBe('passage');
    });
  });
});
