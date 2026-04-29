/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#f8fafc', // slate-50
          900: '#f1f5f9', // slate-100
          800: '#e2e8f0', // slate-200
          700: '#cbd5e1', // slate-300
        },
        mist: '#334155', // slate-700
        // Vibrant Indigo for light mode primary
        accent: {
          DEFAULT: '#4f46e5',
          dim: '#4338ca',
          glow: '#6366f1',
          light: '#e0e7ff',
        },
        // Teal secondary
        cyan: {
          DEFAULT: '#0d9488',
          dim: '#0f766e',
          glow: '#14b8a6',
        },
        hot: {
          DEFAULT: '#f97316',
          dim: '#ea580c',
        },
        stress: { low: '#10b981', mid: '#f59e0b', high: '#ef4444' },
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2s infinite',
        'message-in': 'messageIn 0.3s ease-out forwards',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        messageIn: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-violet': '0 4px 20px rgba(79, 70, 229, 0.25)',
        'glow-cyan': '0 4px 20px rgba(13, 148, 136, 0.25)',
        'glow-accent': '0 4px 30px rgba(79, 70, 229, 0.15)',
        'soft': '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
