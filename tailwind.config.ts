import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: { // Keep sidebar for now, though not directly used by DaisyUI
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        vocabmastertheme: {
          "primary": "#F0A720",        // HSL(49, 89%, 54%)
          "primary-content": "#3E3B33", // Dark text on primary
          "secondary": "#F05F20",      // HSL(19, 89%, 54%) - Using accent as secondary
          "secondary-content": "#FFFFFF", // White text on secondary
          "accent": "#F05F20",         // HSL(19, 89%, 54%)
          "accent-content": "#FFFFFF",   // White text on accent
          "neutral": "#3D4451",
          "neutral-content": "#FFFFFF",
          "base-100": "#E8E2D1",       // HSL(49, 21%, 88%) - Main background
          "base-200": "#EDE8D9",       // Slightly lighter/different for card backgrounds
          "base-300": "#D4CEC0",       // For input backgrounds or borders
          "base-content": "#3E3B33",   // Main text color
          "info": "#2094f3",
          "info-content": "#FFFFFF",
          "success": "#009485",
          "success-content": "#FFFFFF",
          "warning": "#ff9900",
          "warning-content": "#3E3B33",
          "error": "#ff5724",
          "error-content": "#FFFFFF",

          "--rounded-box": "0.75rem", /* default: 1rem */
          "--rounded-btn": "0.5rem",  /* default: 0.5rem */
          "--rounded-badge": "1.9rem", /* default: 1.9rem */
          "--animation-btn": "0.25s", /* default: 0.25s */
          "--animation-input": "0.2s", /* default: 0.2s */
          "--btn-focus-scale": "0.95", /* default: 0.95 */
          "--border-btn": "1px", /* default: 1px */
          "--tab-border": "1px", /* default: 1px */
          "--tab-radius": "0.5rem", /* default: 0.5rem */
        },
      },
      "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"
    ],
    styled: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "dark",
  },
} satisfies Config;
