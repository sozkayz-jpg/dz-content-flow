/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0D0D0D',
          card: '#1A1A1A',
          hover: '#252525',
          border: '#2A2A2A',
        },
        accent: {
          DEFAULT: '#6C63FF',
          hover: '#5A52E0',
          light: '#8B85FF',
        },
        platform: {
          facebook: '#1877F2',
          instagram: '#E4405F',
          tiktok: '#FF0050',
          youtube: '#FF0000',
          linkedin: '#0A66C2',
        },
        status: {
          idea: '#6B7280',
          written: '#F59E0B',
          scheduled: '#3B82F6',
          published: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
