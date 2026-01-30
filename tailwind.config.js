/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-space': '#05070A',
        'electric-cyan': '#00F2FF',
        'neon-violet': '#7000FF',
        'glass-surface': 'rgba(13, 17, 23, 0.6)',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'display': ['Orbitron', 'Rajdhani', 'sans-serif'],
      },
      backgroundImage: {
        'neural-pattern': "radial-gradient(circle at 20% 50%, rgba(0, 242, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(112, 0, 255, 0.1) 0%, transparent 50%)",
      },
      backdropBlur: {
        'glass': '10px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 242, 255, 0.5)',
        'glow-violet': '0 0 20px rgba(112, 0, 255, 0.5)',
        'glow-cyan-sm': '0 0 10px rgba(0, 242, 255, 0.3)',
        'glow-cyan-inner': 'inset 0 0 20px rgba(0, 242, 255, 0.25)',
        'neon-border-cyan': '0 0 15px rgba(0, 242, 255, 0.4)',
        'neon-border-violet': '0 0 15px rgba(112, 0, 255, 0.4)',
      },
      keyframes: {
        'neural-pulse': {
          '0%, 100%': { strokeDashoffset: '0', opacity: '0.6' },
          '50%': { strokeDashoffset: '2', opacity: '1' },
        },
        'neural-node': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'float-particle': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
          '25%': { transform: 'translate(10px, -20px) scale(1.2)', opacity: '0.6' },
          '50%': { transform: 'translate(-5px, -35px) scale(0.9)', opacity: '0.4' },
          '75%': { transform: 'translate(-15px, -15px) scale(1.1)', opacity: '0.5' },
        },
      },
      animation: {
        'neural-pulse': 'neural-pulse 3s ease-in-out infinite',
        'neural-node': 'neural-node 2.5s ease-in-out infinite',
        'float-particle': 'float-particle 15s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
