/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D62649'
        },
        cream: {
          50: '#FFFFFF',
          100: '#F6F6F4',
          200: '#ECEBE7',
          300: '#D9D8D2'
        },
        ink: {
          DEFAULT: '#111014',
          700: '#2A272F',
          500: '#4B4752'
        },
        sakura: {
          DEFAULT: '#FF7A8A',
          soft: '#FFB5B5'
        },
        sora: {
          DEFAULT: '#7AA2FF',
          deep: '#3D4AFF'
        },
        mint: {
          DEFAULT: '#9DE8C3'
        },
        sun: {
          DEFAULT: '#FFD166'
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', '"Noto Sans JP"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', '"Noto Serif JP"', 'serif'],
        mincho: ['"Noto Serif JP"', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      letterSpacing: {
        hyper: '-0.04em'
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        blink: {
          '0%,92%,100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.05)' }
        },
        wobble: {
          '0%,100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' }
        }
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        blink: 'blink 5s infinite',
        wobble: 'wobble 4s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
