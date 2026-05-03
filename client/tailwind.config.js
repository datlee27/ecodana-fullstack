/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // — Design-system tokens (existing) —
        primary: 'var(--ds-color-primary)',
        'primary-hover': 'var(--ds-color-primary-hover)',
        'primary-soft': 'var(--ds-color-primary-soft)',
        secondary: 'var(--ds-color-secondary)',
        'secondary-soft': 'var(--ds-color-secondary-soft)',
        accent: 'var(--ds-color-accent)',
        canvas: 'var(--ds-color-canvas)',
        surface: 'var(--ds-color-surface)',
        muted: 'var(--ds-color-muted)',
        border: 'var(--ds-color-border)',
        'text-base': 'var(--ds-color-text)',
        'text-strong': 'var(--ds-color-text-strong)',
        'text-muted': 'var(--ds-color-text-muted)',
        danger: 'var(--ds-color-danger)',
        warning: 'var(--ds-color-warning)',
        success: 'var(--ds-color-success)',
        info: 'var(--ds-color-info)',
        // — Stitch transplant shell tokens —
        'eco-green':       '#4caf50',
        'eco-green-hover': '#45a049',
        'eco-green-soft':  '#e8f5e9',
        'mobility-blue':      '#2196f3',
        'mobility-blue-soft': '#e3f2fd',
        'muted-surface': '#f1f5f9',
        'border-color':  '#e2e8f0',
      },
      fontFamily: {
        sans: ['var(--ds-font-sans)'],
        poppins: ['var(--ds-font-accent)'],
      },
      borderRadius: {
        sm: 'var(--ds-radius-sm)',
        md: 'var(--ds-radius-md)',
        lg: 'var(--ds-radius-lg)',
        xl: 'var(--ds-radius-xl)',
        full: 'var(--ds-radius-pill)',
      },
      boxShadow: {
        card: 'var(--ds-shadow-card)',
        popover: 'var(--ds-shadow-popover)',
      },
    },
  },
  plugins: [],
};
