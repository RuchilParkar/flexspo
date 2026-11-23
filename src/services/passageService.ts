import { Difficulty, Passage } from '../types';
import officialData from '../data/data.json';

export class PassageService {
  private static cachedData: Record<Difficulty, Passage[]> | null = null;
  private static canonicalPassages: Passage[] | null = null;

  /**
   * Extract canonical passages strictly from the `passages` array in data.json.
   * This guarantees:
   * - Exactly 5 passages for easy, 5 for medium, 9 for hard, 4 for extreme (23 total)
   * - Exactly 23 unique passage IDs
   * - No duplicate entries
   */
  private static parseCanonical(raw: any): Record<Difficulty, Passage[]> {
    const result: Record<Difficulty, Passage[]> = {
      easy: [],
      medium: [],
      hard: [],
      extreme: [],
    };

    if (!raw) return result;

    // Use raw.passages as the canonical source
    const rawList: any[] = Array.isArray(raw.passages)
      ? raw.passages
      : Array.isArray(raw)
      ? raw
      : [
          ...(Array.isArray(raw.easy) ? raw.easy.map((p: any) => ({ ...p, difficulty: 'easy' })) : []),
          ...(Array.isArray(raw.medium) ? raw.medium.map((p: any) => ({ ...p, difficulty: 'medium' })) : []),
          ...(Array.isArray(raw.hard) ? raw.hard.map((p: any) => ({ ...p, difficulty: 'hard' })) : []),
          ...(Array.isArray(raw.extreme) ? raw.extreme.map((p: any) => ({ ...p, difficulty: 'extreme' })) : []),
        ];

    const seenIds = new Set<number>();
    const allUnique: Passage[] = [];

    rawList.forEach((item: any) => {
      const id = typeof item.id === 'number' ? item.id : Number(item.id);
      if (seenIds.has(id)) {
        return; // Skip any duplicate ID to preserve uniqueness
      }
      seenIds.add(id);

      const diff = (item.difficulty || '').toLowerCase() as Difficulty;
      const validDiff: Difficulty =
        diff === 'easy' || diff === 'medium' || diff === 'hard' || diff === 'extreme'
          ? diff
          : 'medium';

      const passage: Passage = {
        id,
        difficulty: validDiff,
        title: item.title || `Passage #${id}`,
        text: item.text || item.passage || '',
      };

      allUnique.push(passage);
      if (result[validDiff]) {
        result[validDiff].push(passage);
      }
    });

    this.canonicalPassages = allUnique;
    return result;
  }

  /**
   * Load passages asynchronously from local data.json, falling back to embedded src/data/data.json
   */
  public static async loadPassages(): Promise<Record<Difficulty, Passage[]>> {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      const response = await fetch('./data.json');
      if (response.ok) {
        const json = await response.json();
        const parsed = this.parseCanonical(json);
        if (
          parsed.easy.length > 0 &&
          parsed.medium.length > 0 &&
          parsed.hard.length > 0 &&
          parsed.extreme.length > 0
        ) {
          this.cachedData = parsed;
          return parsed;
        }
      }
    } catch {
      // Fetch failed or running in non-browser context; fall back to official imported dataset
    }

    const fallbackParsed = this.parseCanonical(officialData);
    this.cachedData = fallbackParsed;
    return fallbackParsed;
  }

  /**
   * Synchronously get all passages categorized by difficulty
   */
  public static getPassagesSync(): Record<Difficulty, Passage[]> {
    if (this.cachedData) return this.cachedData;
    const fallbackParsed = this.parseCanonical(officialData);
    this.cachedData = fallbackParsed;
    return fallbackParsed;
  }

  /**
   * Get all canonical passages as a flat array
   */
  public static getAllPassages(): Passage[] {
    if (!this.canonicalPassages) {
      this.getPassagesSync();
    }
    return this.canonicalPassages || [];
  }

  /**
   * Get passages filtered by difficulty
   */
  public static getPassagesByDifficulty(difficulty: Difficulty): Passage[] {
    const map = this.getPassagesSync();
    return map[difficulty] || [];
  }

  /**
   * Randomly select a passage for the given difficulty, avoiding immediate duplicate if possible.
   * If a category is empty or unavailable, falls back gracefully.
   */
  public static getRandomPassage(difficulty: Difficulty, currentId?: number): Passage {
    const passages = this.getPassagesByDifficulty(difficulty);

    if (passages.length === 0) {
      // Graceful fallback to any available passage across categories
      const all = this.getAllPassages();
      if (all.length > 0) {
        return all[0];
      }
      return {
        id: 1,
        difficulty: 'easy',
        title: 'Sunny Morning',
        text: 'The morning sun was warm and bright. A gentle breeze moved through the trees as birds sang their morning songs. Children played happily in the park while families walked along the peaceful path.',
      };
    }

    if (passages.length === 1) {
      return passages[0];
    }

    // Filter out currentId when multiple options exist to prevent consecutive duplicates on restart
    const candidates = passages.filter((p) => p.id !== currentId);
    const pool = candidates.length > 0 ? candidates : passages;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }
}
