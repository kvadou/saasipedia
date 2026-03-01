import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        wiki: {
          bg: '#FFFFFF',
          'bg-alt': '#F8F9FA',
          text: '#1A1A2E',
          'text-muted': '#6B7280',
          accent: '#2563EB',
          'accent-hover': '#1D4ED8',
          indigo: '#6366F1',
          border: '#E5E7EB',
          'border-dark': '#D1D5DB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
