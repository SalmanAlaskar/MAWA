import type { Config } from 'tailwindcss';

// Design tokens pulled 1:1 from the approved mockup (scratchpad/mockups.html).
// This is the only palette the product uses — light-only, no dark mode.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: undefined,
  theme: {
    extend: {
      colors: {
        bg: '#F7F3EA',
        surface: '#FFFFFF',
        'surface-2': '#FBF8F1',
        ink: '#2A2420',
        'ink-soft': '#6B6255',
        line: '#E4DAC4',
        accent: {
          DEFAULT: '#0C7B85',
          strong: '#095F67',
          tint: '#E1F1EF',
        },
        clay: '#B5652E',
        success: {
          DEFAULT: '#5C7F35',
          tint: '#EAF1DC',
        },
        warning: {
          DEFAULT: '#A8752E',
          tint: '#F5EBD6',
        },
        critical: {
          DEFAULT: '#A5402F',
          tint: '#F5E2DD',
        },
        neutral: {
          tint: '#EFEAE0',
        },
      },
      fontFamily: {
        // Calibri is the brand typeface for both languages (Light body copy,
        // Bold headings — see globals.css and the `font-heading` utility).
        // It has no Arabic glyphs, so Arabic text automatically falls
        // through to Segoe UI/Tahoma per the browser's per-character font
        // matching — no separate Arabic stack needed.
        sans: ['Calibri', 'Segoe UI', 'Tahoma', 'Helvetica Neue', 'Arial', 'sans-serif'],
        heading: ['Calibri', 'Segoe UI', 'Tahoma', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
