import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette (Navy)
        primary: {
          DEFAULT: '#001e40',
          container: '#003366',
          light: '#004080',
          dark: '#001428',
        },
        // Secondary palette (Ochre/Burnt Orange - Action Color)
        secondary: {
          DEFAULT: '#954900',
          container: '#fd8f38',
          light: '#ff9f4d',
          dark: '#7a3900',
        },
        // Tertiary palette (Gold - Smart/Success Color)
        tertiary: {
          DEFAULT: '#d4a942',
          fixed: '#ffe088',
          container: '#f5d576',
          light: '#ffeea8',
          dark: '#b8923a',
        },
        // Surface hierarchy
        surface: {
          DEFAULT: '#f8f9fa',
          'container-lowest': '#ffffff',
          'container-low': '#f3f4f5',
          'container': '#edeef0',
          'container-high': '#e7e9ea',
          'container-highest': '#e1e3e4',
          tint: 'rgba(0, 30, 64, 0.05)',
        },
        // Semantic colors
        error: {
          DEFAULT: '#dc2626',
          container: '#fee2e2',
          light: '#ef4444',
          dark: '#b91c1c',
        },
        on: {
          surface: '#191c1d',
          primary: '#ffffff',
          secondary: '#ffffff',
          'secondary-container': '#2d1600',
          'tertiary-fixed': '#3d2f00',
        },
        outline: {
          DEFAULT: '#79747E',
          variant: '#c3c6d1',
        },
        // Warm Canvas palette
        cream: {
          base: '#FAF7F2',
        },
        'quiz-card': '#FFFFFF',
        purple: {
          primary: '#5B3E8F',
          light: '#EDE6F6',
        },
        ink: {
          primary: '#1A1523',
          muted: '#7C6F8E',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Manrope', 'sans-serif'],
        body: ['var(--font-body)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      fontSize: {
        // Display (Manrope)
        'display-lg': ['3.5rem', { lineHeight: '4rem', letterSpacing: '-0.02em' }],
        'display-md': ['2.75rem', { lineHeight: '3.25rem', letterSpacing: '-0.02em' }],
        'display-sm': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.01em' }],
        // Headlines (Manrope)
        'headline-lg': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.01em' }],
        'headline-md': ['1.75rem', { lineHeight: '2.25rem' }],
        'headline-sm': ['1.5rem', { lineHeight: '2rem' }],
        // Titles (Plus Jakarta Sans)
        'title-lg': ['1.375rem', { lineHeight: '1.75rem' }],
        'title-md': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'title-sm': ['1rem', { lineHeight: '1.375rem', fontWeight: '600' }],
        // Body (Plus Jakarta Sans)
        'body-lg': ['1rem', { lineHeight: '1.5rem' }],
        'body-md': ['0.875rem', { lineHeight: '1.25rem' }],
        'body-sm': ['0.75rem', { lineHeight: '1rem' }],
        // Labels (Plus Jakarta Sans)
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.05em' }],
        'label-md': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
        'label-sm': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
      },
      boxShadow: {
        'ghost': '0 20px 40px rgba(0, 30, 64, 0.06)',
        'ghost-sm': '0 10px 20px rgba(0, 30, 64, 0.04)',
        'ghost-lg': '0 30px 60px rgba(0, 30, 64, 0.08)',
      },
      spacing: {
        'spacing-1': '0.25rem',   // 4px
        'spacing-2': '0.5rem',    // 8px
        'spacing-3': '0.75rem',   // 12px
        'spacing-4': '1rem',      // 16px
        'spacing-5': '1.25rem',   // 20px
        'spacing-6': '1.5rem',    // 24px
        'spacing-8': '2rem',      // 32px
        'spacing-10': '2.5rem',   // 40px
        'spacing-12': '3rem',     // 48px
        'spacing-16': '4rem',     // 64px
        'spacing-20': '5rem',     // 80px
        'spacing-24': '6rem',     // 96px
      },
    },
  },
  plugins: [],
};
export default config;
