import type { Config } from "tailwindcss";
import type { PluginAPI } from 'tailwindcss/types/config';
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./styles/**/*.css",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',      // 16px mobile
        sm: '1.5rem',         // 24px tablets
        md: '2rem',           // 32px small desktops
        lg: '2.5rem',         // 40px large desktops
      },
      screens: {
        "2xl": "1536px",
      },
    },
    extend: {
      screens: {
        'xs': '320px',    // iPhone SE, small Android phones
        'sm': '640px',    // Large phones, small tablets  
        'md': '768px',    // Tablets, iPad
        'lg': '1024px',   // Laptops, desktops
        'xl': '1280px',   // Large desktops
        '2xl': '1536px',  // Extra large desktops
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          'primary-foreground': "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          'accent-foreground': "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Industrial Theme Colors - Premium Redesign
        navy: {
          DEFAULT: "#0B2023", // Dark Teal
          light: "#123035",   // Lighter Dark Teal
        },
        dark: {
          DEFAULT: "#020817",
        },
        offwhite: {
          DEFAULT: "#FDFBF7", // Cream
        },
        cyan: {
          DEFAULT: "#16D6E8",
        },
        industrial: {
          DEFAULT: "#22c55e", // Light Green
          dark: "#16a34a",    // Dark Green
          light: "#dcfce7",   // Pale Green
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--primary-foreground))",
        },
        footer: {
          bg: "#07111F",
          text: "#F7F9FA",
          muted: "#64748B",
        },
        bag: "hsl(var(--bag-color))",
        spark: "hsl(var(--spark-color))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.8s ease-out",
        "slide-in-right": "slide-in-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "float": "float 6s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'nav': 'var(--shadow-nav)',
        'industrial': '0 0 10px hsla(var(--bag-color) / 0.1)',
      },

      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `,
        'grid-3d': `
          linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px),
          linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px)
        `,
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-primary': 'var(--gradient-primary)',
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },

    },
  },
  plugins: [
    tailwindcssAnimate,

    // ✅ TYPE-SAFE CUSTOM PLUGIN
    function ({ addUtilities, theme }: PluginAPI) {
      const newUtilities = {
        '.glass-effect': {
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.125)',
        },
        '.glass-effect-white': {
          backdropFilter: 'blur(20px) saturate(200%)',
          WebkitBackdropFilter: 'blur(20px) saturate(200%)',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        },
        '.bg-grid-white-5': {
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        },
        '.transform-style-3d': {
          transformStyle: 'preserve-3d',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },
        '.perspective-1000': {
          perspective: '1000px',
        },
      };

      addUtilities(newUtilities, {
        respectPrefix: true,
        respectImportant: true,
      });
    },

    // ✅ ANOTHER TYPE-SAFE PLUGIN FOR RESPONSIVE UTILITIES
    function ({ addComponents, theme }: PluginAPI) {
      const components = {
        '.responsive-container': {
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          '@screen sm': {
            paddingLeft: theme('spacing.6'),
            paddingRight: theme('spacing.6'),
          },
          '@screen lg': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
          },
        },
        '.industrial-gradient-text': {
          background: `linear-gradient(135deg, ${theme('colors.industrial.blue')} 0%, ${theme('colors.industrial["blue-light"]')} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
      };


    },
  ],
} satisfies Config;