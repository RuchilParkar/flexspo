# flexspo — Premium Typing Speed Test Web App

A modern, responsive, high-performance Typing Speed Test web application designed as a premium productivity-meets-gaming experience.

## ✨ Features

### 1. Test Modes & Difficulty
- **Timed Mode**: 60-second high-intensity countdown timer.
- **Passage Mode**: Open-ended count-up timer until the full passage is completed.
- **Mode Switching Guard**: Smooth mode switching in idle state; locked during active runs to prevent state corruption unless explicitly restarted.
- **3 Difficulty Tiers**:
  - **Easy**: Simple vocabulary, everyday words, and short sentences.
  - **Medium**: Balanced sentence structures, standard punctuation, and moderately complex vocabulary.
  - **Hard**: Complex clauses, punctuation, technical terminology, and challenging structures.
- **Dynamic Passage Loading**: Loads from local `data.json` with multi-schema normalization and guaranteed random passage selection on every restart.

### 2. Real-Time Precision Metrics
- **WPM (Words Per Minute)**: Standard CPM/5 calculation based strictly on correctly typed characters: `(correctCharacters / 5) / (elapsedMinutes)`.
- **Cumulative Accuracy %**: Accurately accounts for all attempted keystrokes. Correcting mistakes with Backspace does **not** erase the cumulative penalty.
- **Character Counters**: Live breakdown of correctly typed characters, active errors, and cumulative errors.
- **Time Elapsed / Remaining**: Real-time counter with visual urgency pulses in the final 10 seconds of timed mode.
- **Live Progress Bar**: Shows passage completion percentage in real time.

### 3. Gamified & Interactive "Fun" Elements
- **Dynamic Streak & Combo Multiplier**: Real-time counter for consecutive correct keystrokes with milestone badges (`5x`, `25x`, `50x`, `75x`).
- **WPM Surge Animation**: Subtle scale and glowing animation when typing velocity jumps.
- **Milestone Banners**: Encouraging feedback alerts triggered by streaks and speed milestones:
  - *"You're warming up! 🔥"*
  - *"Nice rhythm! ✨"*
  - *"You're on fire! ⚡"*
  - *"Speed demon! 🚀"*
  - *"Precision machine! 💎"*
  - *"That was clean! 🎯"*
- **Synthesized Web Audio Effects**: OFF by default, built entirely with the browser Web Audio API:
  - Mechanical switch key clicks
  - Subtle error buzz
  - Uplifting streak milestone chimes
  - Celebratory victory fanfare
- **Multi-Particle Confetti**: Powered by Canvas Confetti when a personal best is smashed.

### 4. Personal Best & Records (localStorage)
- **First Completed Test**: Displays `"Baseline Established!"` with celebratory sound and benchmark saving.
- **New Record**: Displays `"High Score Smashed!"` with confetti celebration and delta comparisons against previous best.
- **Subsequent Tests**: Displays `"Test Complete!"` with performance encouragement.

### 5. Keyboard-First UX & Accessibility
- **Zero-Click Immediate Typing**: Start typing instantly without needing to click any input.
- **Visible Cursor**: Smooth pulsing caret positioned accurately at the next untyped character.
- **Space Error Visualization**: Mistyped spaces render with a distinct `␣` badge.
- **Auto-Scrolling**: Keeps active text line smoothly centered in the viewport.
- **Keyboard Shortcuts**:
  - `Esc`: Instant restart with a fresh passage.
  - `Enter` / `Space`: Instant "Play Again" from the results modal.
  - `Backspace`: Correction support.
- **Full WCAG Accessibility**: ARIA roles, focus rings, semantic color palettes (not relying solely on color), and `@media (prefers-reduced-motion)` support.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS (Dark Mode, Custom Design System)
- **Icons**: Lucide React
- **Celebration**: Canvas-Confetti
- **Audio**: Web Audio API (zero asset dependencies)
- **Build Tool**: Vite 6
- **Test Runner**: Vitest + Testing Library + jsdom

---

## 🚀 Getting Started

### Development Server
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

### Production Build
```bash
npm run build
npm run preview
```
