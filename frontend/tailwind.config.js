/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary: Modern Indigo (Trust, Premium)
        primary: "#6366F1",
        "primary-container": "#818CF8",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#1e1b4b",
        "primary-fixed": "#E0E7FF",
        "primary-fixed-dim": "#A5B4FC",
        "inverse-primary": "#A5B4FC",
        
        // Secondary: Teal (Care, Growth)
        secondary: "#14B8A6",
        "secondary-container": "#5EEAD4",
        "on-secondary": "#ffffff",
        "on-secondary-fixed": "#042f2e",
        "secondary-fixed": "#CCFBF1",
        "secondary-fixed-dim": "#99F6E4",
        
        // Tertiary: Amber (Warmth, Action)
        tertiary: "#F59E0B",
        "tertiary-container": "#FCD34D",
        "on-tertiary": "#ffffff",
        "on-tertiary-fixed": "#451a03",
        "tertiary-fixed": "#FEF3C7",
        "tertiary-fixed-dim": "#FDE68A",
        
        // Status
        error: "#EF4444",
        "on-error": "#ffffff",
        "error-container": "#FEE2E2",
        success: "#10B981",
        warning: "#F59E0B",
        
        // Surface colors — clean whites
        background: "#F8FAFC",
        surface: "#F8FAFC",
        "surface-bright": "#FFFFFF",
        "surface-dim": "#E2E8F0",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#F1F5F9",
        "surface-container": "#E2E8F0",
        "surface-container-high": "#CBD5E1",
        "surface-container-highest": "#94A3B8",
        "inverse-surface": "#1E293B",
        "surface-tint": "#6366F1",
        "surface-variant": "#F1F5F9",
        
        // Text/On colors
        "on-background": "#0F172A",
        "on-surface": "#0F172A",
        "on-surface-variant": "#475569",
        "inverse-on-surface": "#F8FAFC",
        
        // Outline
        outline: "#94A3B8",
        "outline-variant": "#E2E8F0",
        
        "text-primary": "#0F172A",
        "text-secondary": "#475569",
        "text-tertiary": "#94A3B8",
        border: "#E2E8F0",
        disabled: "#CBD5E1",
        divider: "#F1F5F9",
      },
      fontFamily: {
        // Display: Montserrat for strong, distinctive headlines
        display: ["Montserrat_900Black", "Montserrat_700Bold"],
        // Body: Poppins for warm, approachable text
        body: ["Poppins_400Regular", "Poppins_500Medium", "Poppins_600SemiBold"],
        poppins: ["Poppins_400Regular", "Poppins_600SemiBold", "Poppins_700Bold"],
        montserrat: ["Montserrat_600SemiBold", "Montserrat_700Bold"],
      },
      spacing: {
        'xs': '4px',
        's': '8px',
        'sm': '8px',
        'm': '16px',
        'md': '16px',
        'l': '24px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'gutter': '16px',
        'container-max': '1200px'
      },
      fontSize: {
        'headline-xl': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'headline-lg': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'label-caps': ['10px', { lineHeight: '14px', fontWeight: '600', letterSpacing: '0.05em' }]
      },
      borderRadius: {
        'xs': '4px',
        's': '8px',
        'm': '12px',
        'l': '16px',
        'xl': '20px',
        'full': '9999px',
      },
      shadows: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
};
