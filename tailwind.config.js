/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#090a0f',
          subtle: '#0f1118',
          card: '#13151f',
          surface: '#181b26',
          border: 'rgba(255, 255, 255, 0.07)',
          'border-hover': 'rgba(255, 255, 255, 0.16)',
          text: '#f8fafc',
          untyped: '#475569',
          muted: '#8490a0',
          faint: '#4a5363',
          dimmed: '#323946',
        },
        accent: {
          DEFAULT: '#e2b714',
          subtle: 'rgba(226, 183, 20, 0.12)',
          indigo: '#6366f1',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.03em',
        tighter: '-0.02em',
        tight: '-0.01em',
        wide: '0.04em',
        wider: '0.08em',
        widest: '0.14em',
      },
      keyframes: {
        cursorBlink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'cursor-blink': 'cursorBlink 1.05s ease-in-out infinite',
        'fade-in': 'fadeIn 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
};
