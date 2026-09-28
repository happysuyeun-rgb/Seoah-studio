/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0C1222',
          soft: '#243044',
          faint: '#4A5568',
        },
        canvas: '#F5F6F8',
        paper: '#FFFFFF',
        line: '#E4E7EE',
        signal: {
          DEFAULT: '#2F6BFF',
          hover: '#1E56E0',
          soft: '#EAF0FF',
        },
        // Legacy class names (bg-primary, text-primary) follow Signal Blue.
        primary: {
          DEFAULT: '#2F6BFF',
          light: '#EAF0FF',
        },
      },
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          'Pretendard',
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      fontSize: {
        display: ['clamp(3.5rem, 4.5vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.045em', fontWeight: '600' }],
        title: ['clamp(2.25rem, 2.8vw, 3rem)', { lineHeight: '1.08', letterSpacing: '-0.035em', fontWeight: '600' }],
        lead: ['clamp(1rem, 1.05vw, 1.125rem)', { lineHeight: '1.65' }],
      },
      maxWidth: {
        shell: '1280px',
        hero: '1360px',
        copy: '40rem',
      },
    },
  },
  plugins: [],
}
