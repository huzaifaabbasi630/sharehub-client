/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        whatsapp: {
          bg: '#f0f2f5',
          green: '#00a884',
          'green-dark': '#008069',
          chat: '#efeae2',
          'chat-out': '#d9fdd3',
          'chat-in': '#ffffff',
        }
      }
    },
  },
  plugins: [],
}
