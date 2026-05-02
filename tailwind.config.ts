import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        ink: { DEFAULT: '#0B0B0F', soft: '#1A1A20', muted: '#5A5A66' },
        paper: { DEFAULT: '#FBFAF7', warm: '#F4F1EA' },
        signal: { DEFAULT: '#FF5C2A', soft: '#FFE9DF' },
        accent: { DEFAULT: '#0066FF', soft: '#E6EFFF' },
        line: '#E5E1D7',
      },
      maxWidth: { content: '72rem' },
      letterSpacing: { tightest: '-0.04em' },
    },
  },
  plugins: [],
};
export default config;
