// 1. Global Tokens (Mode-Agnostic: These NEVER change between light/dark mode)
export type GlobalTokens = {
  spacing: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl', string>
  borderRadius: Record<'sm' | 'base' | 'md' | 'lg' | 'full', string>

  // Consolidated Typography: Only the unchangeable geometry lives here.
  typography: {
    fontFamily: string
    fontFamilyMono: string
    fontFamilySerif: string
    fontSize: Record<
      'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl',
      string
    >
    lineHeight: Record<'tight' | 'normal' | 'relaxed', number | string>
    letterSpacing: Record<
      'tighter' | 'tight' | 'normal' | 'wide' | 'widest',
      string
    >
  }

  zIndices: Record<
    'base' | 'nav' | 'overlay' | 'modal' | 'toast' | 'popover',
    number
  >
  animation: Record<'fast' | 'normal' | 'slow', string>
}

// 2. Theme Tokens (Mode-Specific: These swap out on Light/Dark toggle)
export type ThemeTokens = {
  colors: {
    primary: Record<50 | 100 | 500 | 600 | 700, string>
    accent: Record<500, string> // Zari Gold
    neutral: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 900, string> // Replaced 'gray'

    background: {
      primary: string
      secondary: string
      tertiary: string
      muted: string
    }
    text: {
      primary: string
      secondary: string
      tertiary: string
      muted: string
      inverted: string
    }
    border: {
      default: string
      focus: string
      strong: string
    }
    state: {
      success: string
      error: string
      warning: string
      info: string
      successSubtle: string // Background for Success Alert/Badge
      errorSubtle: string
      warningSubtle: string
      infoSubtle: string
    }
    action: {
      primarySubtle: string // Your Sidebar active state
      primaryHover: string
      secondarySubtle: string // For secondary active states
      ghostHover: string // For transparent buttons
    }
  }

  // Theme-specific typography overrides to handle dark mode optical adjustments
  typography: {
    lineHeight: { relaxed: number | string }
    letterSpacing: { normal: string } // Allows slightly wider tracking in dark mode
    fontWeight: Record<'normal' | 'medium' | 'semibold' | 'bold', number> // Thinner in dark mode
    fontSmoothing: boolean // Auto in Light, Antialiased in Dark
  }

  // Shadows are strictly mode-dependent
  shadows: Record<'sm' | 'md' | 'lg' | 'xl' | 'inner', string> // Expanded to include xl and inner
}

// 3. The Master Definition
export type DesignSystem = {
  global: GlobalTokens
  modes: {
    light: ThemeTokens
    dark: ThemeTokens
  }
}
