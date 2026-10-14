import { DesignSystem } from '../tokenDefinition'

const RiversideTokens: DesignSystem = {
  // ----------------------------------------------------------------------
  // GLOBAL TOKENS: The Physical Architecture (Stability & Heritage)
  // ----------------------------------------------------------------------
  global: {
    spacing: {
      xs: '0.25rem', // 4px - Tight component gaps
      sm: '0.5rem', // 8px - Label/Icon spacing
      md: '1rem', // 16px - Standard padding
      lg: '1.5rem', // 24px - Section chunking
      xl: '2rem', // 32px - Layout margins
      '2xl': '3rem', // 48px - Section breathing room
      '3xl': '4rem', // 64px - Major section dividers
    },

    // Border radius kept slightly tight to maintain a sharp, engineered feel
    borderRadius: {
      sm: '0.125rem', // 2px - Checkboxes, tags
      base: '0.25rem', // 4px - Standard buttons, inputs
      md: '0.375rem', // 6px - Small cards, dropdowns
      lg: '0.5rem', // 8px - Main project cards, modals
      full: '9999px', // Pills, avatars
    },

    // Consolidated Typography
    typography: {
      // CSS variables mapped to Google Fonts or local font files
      fontFamily: '"Geist Sans", "Inter", sans-serif',
      fontFamilyMono: '"JetBrains Mono", "Geist Mono", monospace',
      fontFamilySerif: '"Newsreader", "Playfair Display", serif',

      // Scale designed for high contrast between Display and Body
      fontSize: {
        xs: '0.75rem', // 12px - Badges, micro-labels
        sm: '0.875rem', // 14px - UI text, secondary labels
        base: '1rem', // 16px - Primary body paragraphs
        md: '1.125rem', // 18px - Large body, card descriptions
        lg: '1.25rem', // 20px - Subtitles, small headings
        xl: '1.5rem', // 24px - Section Titles
        '2xl': '2rem', // 32px - Major Headings
        '3xl': '2.5rem', // 40px - Display Secondary
        '4xl': '3rem', // 48px - Display Primary (Hero)
        '5xl': '4rem', // 64px - Massive hero hooks
      },

      // Strict line heights for UI vs Reading
      lineHeight: {
        tight: 1.2, // For Display/Headings (prevents awkward gaps)
        normal: 1.5, // Standard for UI elements and short text
        relaxed: 1.75, // For long-form technical architecture reading
      },

      // Tighter spacing on large text looks premium; wider spacing helps micro-text
      letterSpacing: {
        tighter: '-0.04em', // For massive Display text (4xl, 5xl)
        tight: '-0.02em', // For Headings (xl, 2xl)
        normal: '0em', // For Body text
        wide: '0.025em', // For ALL CAPS labels or badges
        widest: '0.05em', // For extreme stylistic uppercase accents
      },
    },
    zIndices: {
      base: 0,
      nav: 10,
      overlay: 20,
      modal: 30,
      popover: 40,
      toast: 50,
    },
    animation: {
      // Snappy & Immediate: For hovers, focus rings, and micro-interactions.
      fast: '150ms ease-out',

      // Premium & Fluid: For tab switching, modal openings, and slide-overs.
      normal: '300ms cubic-bezier(0.32, 0.72, 0, 1)',

      // Controlled & Dramatic: For large accordion expansions or page transitions.
      slow: '500ms cubic-bezier(0.16, 1, 0.3, 1)',
    },
  },

  // ----------------------------------------------------------------------
  // THEME MODES: The Royal Palettes
  // ----------------------------------------------------------------------
  modes: {
    light: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca', // Main Light Primary
        },
        accent: {
          500: '#f8ea58', // Zari Gold / Creative Accent
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          900: '#0f172a',
        },
        background: {
          primary: '#f8fafc', // Main canvas
          secondary: '#ffffff', // Cards, elevated surfaces
          tertiary: '#f1f5f9', // Sidebar, alternate sections
          muted: '#e2e8f0', // Disabled states, skeletons
        },
        text: {
          primary: '#1e293b', // High contrast reading
          secondary: '#475569', // Subtitles, metadata
          tertiary: '#64748b', // Placeholder, tertiary info
          muted: '#94a3b8', // Disabled text
          inverted: '#ffffff', // Text on primary buttons
        },
        border: {
          default: '#e2e8f0', // Standard dividers
          focus: '#4338ca', // Ring color on input focus
          strong: '#cbd5e1', // High contrast borders
        },
        state: {
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
          successSubtle: '#d1fae5',
          errorSubtle: '#fee2e2',
          warningSubtle: '#fef3c7',
          infoSubtle: '#dbeafe',
        },
        action: {
          primarySubtle: '#e0e7ff', // Sidebar active state
          primaryHover: '#4f46e5',
          secondarySubtle: '#f1f5f9', // Secondary button hover
          ghostHover: 'rgba(71, 85, 105, 0.05)', // Transparent button hover
        },
      },
      typography: {
        lineHeight: { relaxed: 1.75 },
        letterSpacing: { normal: '0em' },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
        fontSmoothing: false, // Relies on browser default (auto)
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
    },

    // ---------------- DARK: "Kohl & Shastar" (Charcoal & Steel) ----------------
    dark: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1', // Main Dark Primary
          600: '#4f46e5',
          700: '#4338ca',
        },
        accent: {
          500: '#f43f5e', // Vibrant Rose / Creative Accent
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          900: '#0f172a',
        },
        background: {
          primary: '#0b0f19', // Main canvas
          secondary: '#131a2b', // Cards, elevated surfaces (slightly lighter than primary)
          tertiary: '#1e293b', // Sidebar, alternate sections
          muted: '#334155', // Disabled states, skeletons
        },
        text: {
          primary: '#e2e8f0', // Soft silver to prevent eye strain
          secondary: '#94a3b8', // Subtitles, metadata
          tertiary: '#64748b', // Placeholder, tertiary info
          muted: '#475569', // Disabled text
          inverted: '#0b0f19', // Text on bright primary buttons
        },
        border: {
          default: '#1e293b', // Standard dividers
          focus: '#6366f1', // Ring color on input focus
          strong: '#334155', // High contrast borders
        },
        state: {
          success: '#34d399',
          error: '#f87171',
          warning: '#fbbf24',
          info: '#60a5fa',
          successSubtle: 'rgba(16, 185, 129, 0.15)', // Alpha overlays prevent muddy dark colors
          errorSubtle: 'rgba(239, 68, 68, 0.15)',
          warningSubtle: 'rgba(245, 158, 11, 0.15)',
          infoSubtle: 'rgba(59, 130, 246, 0.15)',
        },
        action: {
          primarySubtle: 'rgba(99, 102, 241, 0.15)', // Sidebar active state
          primaryHover: '#818cf8',
          secondarySubtle: '#1e293b', // Secondary button hover
          ghostHover: 'rgba(148, 163, 184, 0.1)', // Transparent button hover
        },
      },
      typography: {
        lineHeight: { relaxed: 1.8 }, // Slightly higher to improve dark mode readability
        letterSpacing: { normal: '0.015em' }, // Prevents dark mode optical "haloing" (letters bleeding together)
        fontWeight: {
          normal: 300, // Dropped weights by ~100 to compensate for light text expanding on dark backgrounds
          medium: 400,
          semibold: 500,
          bold: 600,
        },
        fontSmoothing: true, // Triggers -webkit-font-smoothing: antialiased
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.5)',
      },
    },
  },
}

export default RiversideTokens
