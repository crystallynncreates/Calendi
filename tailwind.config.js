/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#06060F',
        surface: 'rgba(255,255,255,0.035)',
        'surface-hover': 'rgba(255,255,255,0.065)',
        border: 'rgba(255,255,255,0.08)',
        'text-1': '#E2E8F0',
        'text-2': 'rgba(226,232,240,0.5)',
        'text-3': 'rgba(226,232,240,0.28)',
        violet: { DEFAULT: '#7C3AED', light: '#8B5CF6', dim: 'rgba(124,58,237,0.2)' },
        cyan: { DEFAULT: '#06B6D4', light: '#22D3EE', dim: 'rgba(6,182,212,0.2)' },
        pink: { DEFAULT: '#DB2777', light: '#EC4899', dim: 'rgba(219,39,119,0.2)' },
        amber: { DEFAULT: '#D97706', light: '#F59E0B', dim: 'rgba(217,119,6,0.2)' },
        emerald: { DEFAULT: '#059669', light: '#10B981', dim: 'rgba(5,150,105,0.2)' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease',
        'fade-in': 'fadeIn 0.25s ease',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        slideUp: { from: { transform: 'translateY(16px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
      },
    },
  },
  plugins: [],
};
