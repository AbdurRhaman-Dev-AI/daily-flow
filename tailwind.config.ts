import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          surface: "rgba(255, 255, 255, 0.65)",
          border: "rgba(255, 255, 255, 0.60)",
          shine: "rgba(255, 255, 255, 0.90)",
          shadow: "rgba(31, 38, 135, 0.07)",
        },
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '64px',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'liquid': '0 8px 32px 0 rgba(100, 116, 139, 0.10), 0 2px 8px 0 rgba(100, 116, 139, 0.06)',
        'liquid-lg': '0 16px 48px 0 rgba(99, 102, 241, 0.12), 0 4px 16px 0 rgba(148, 163, 184, 0.12)',
        'liquid-inner': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.8), 0 8px 32px 0 rgba(100, 116, 139, 0.10)',
        'glow-primary': '0 0 24px -4px rgba(99, 102, 241, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-up': 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float-slow': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(6px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
