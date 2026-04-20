import type { Config } from 'tailwindcss'

export default {
  content: [
    './client/src/**/*.{js,jsx,ts,tsx}',
    './client/index.html',
  ],
  theme: {
    extend: {
      colors: {
        // ─── Forma Pearl & Gold ──────────────────────────────────────────────
        forma: {
          linen:       '#F4F1EE', // fundo principal (páginas claras)
          champagne:   '#EFECE6', // fundo seções diferenciadas
          charcoal:    '#2A2A2A', // textos fortes, títulos
          gold:        '#BFA16F', // destaque principal (rgb 191 161 111)
          'gold-warm': '#C5A059', // variante mais quente (botões, ícones)
          muted:       '#9A9087', // textos secundários, labels
          dark:        '#080612', // fundo páginas escuras
          'dark-mid':  '#0D0923', // fundo seções escuras intermediárias
        },
      },
      fontFamily: {
        poppins:   ['Poppins', 'sans-serif'],
        inter:     ['Inter', 'sans-serif'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
