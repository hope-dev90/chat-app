module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryBlue: '#1A56DB',
        darkNavy: '#1E293B',
        lightGrayBg: '#F8FAFC',
        whiteCard: '#FFFFFF',
        accentGreen: '#10B981',
        accentOrange: '#F59E0B',
        coral: '#EF6C6C'
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'card': '8px',
        'pill': '20px',
      }
    },
  },
  plugins: [],
}