/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  safelist: [
    'bg-primary/10', 'text-primary', 'border-primary/20',
    'bg-emerald-light', 'text-emerald', 'border-emerald/20',
    'bg-orange-light', 'text-orange', 'border-orange/20',
    'bg-red-light', 'text-red', 'border-red/20',
    'bg-blue-light', 'text-blue', 'border-blue/20',
    'bg-purple-light', 'text-purple', 'border-purple/20',
    'bg-yellow-light', 'text-yellow', 'border-yellow/20',
    'bg-green-light', 'text-green', 'border-green/20',
    'text-secondary-foreground', 'bg-secondary', 'bg-secondary/80',
    'bg-muted/50', 'border-sidebar-border', 'bg-sidebar',
    'text-muted-foreground', 'hover:bg-muted',
    'text-card-foreground', 'bg-card', 'border-border',
    'hover:text-primary', 'hover:shadow-lg', 'hover:-translate-y-1',
    'animate-fade-in', 'animate-pulse',
  ],
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        orange: {
          DEFAULT: 'hsl(var(--orange))',
          light: 'hsl(var(--orange-light))',
        },
        blue: {
          DEFAULT: 'hsl(var(--blue))',
          light: 'hsl(var(--blue-light))',
        },
        emerald: {
          DEFAULT: 'hsl(var(--emerald))',
          light: 'hsl(var(--emerald-light))',
        },
        purple: {
          DEFAULT: 'hsl(var(--purple))',
          light: 'hsl(var(--purple-light))',
        },
        red: {
          DEFAULT: 'hsl(var(--red))',
          light: 'hsl(var(--red-light))',
        },
        yellow: {
          DEFAULT: 'hsl(var(--yellow))',
          light: 'hsl(var(--yellow-light))',
        },
        green: {
          DEFAULT: 'hsl(var(--green))',
          light: 'hsl(var(--green-light))',
        },
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};