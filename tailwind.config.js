/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ],
        mono: [
          "SF Mono",
          "ui-monospace",
          "Menlo",
          "Monaco",
          "Cascadia Mono",
          "monospace"
        ]
      },
      colors: {
        apple: {
          blue: '#007AFF',
          'blue-dark': '#0A84FF',
          gray: {
            bg: '#F5F5F7',
            card: '#FFFFFF',
            border: 'rgba(0, 0, 0, 0.08)',
            text: '#1D1D1F',
            secondary: '#86868B',
            tertiary: '#AEAEB2',
          },
          dark: {
            bg: '#000000',
            surface: '#161618',
            card: '#1C1C1E',
            cardSecondary: '#2C2C2E',
            border: 'rgba(255, 255, 255, 0.1)',
            text: '#F5F5F7',
            secondary: '#A1A1A6',
          }
        }
      },
      boxShadow: {
        'apple-card': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'apple-hover': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03)',
        'apple-popover': '0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
