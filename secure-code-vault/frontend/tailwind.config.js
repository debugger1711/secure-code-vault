/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vault: {
          950: '#020817', // Deep blue-black
          900: '#041a2f', // Rich blue
          800: '#0a2a4a', // Medium blue
          700: '#0f3a5c', // Blue-gray
          600: '#1a4f7a', // Light blue-gray
          500: '#2563eb', // Bright blue
          400: '#3b82f6', // Sky blue
          300: '#60a5fa', // Light sky blue
          200: '#93c5fd', // Very light blue
          100: '#dbeafe', // Pale blue
          50:  '#eff6ff', // Almost white blue
        },
        accent: {
          DEFAULT: '#3b82f6', // Bright blue
          dark: '#2563eb', // Darker blue
          glow: 'rgba(59,130,246,0.15)', // Blue glow
        },
        danger: '#ef4444', // Red
        success: '#10b981', // Emerald
        warning: '#f59e0b', // Amber
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(59,130,246,0.3)', // Blue glow
        'glow-sm': '0 0 10px rgba(59,130,246,0.2)', // Blue glow
        'glow-lg': '0 0 30px rgba(59,130,246,0.4)', // Large blue glow
        'inner-glow': 'inset 0 0 20px rgba(59,130,246,0.05)', // Blue inner glow
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideIn: { '0%': { transform: 'translateY(-10px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 10px rgba(59,130,246,0.2)' }, '50%': { boxShadow: '0 0 25px rgba(59,130,246,0.5)' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-5px)' } }
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #020817 0%, #041a2f 50%, #0a2a4a 100%)',
        'gradient-accent': 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(96,165,250,0.05))',
      }
    },
  },
  plugins: [],
};
