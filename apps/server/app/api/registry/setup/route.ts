import { NextResponse } from 'next/server.js'
import fs from 'fs/promises'
import path from 'path'

export interface SetupFile {
  name: string
  content: string
}

export interface SetupResponse {
  packageDependencies: string[]
  files: SetupFile[]
}

export interface SetupErrorResponse {
  error: string
}

// Return files(name, content) and needed packageDependencies.
export async function GET(
  request: Request
): Promise<NextResponse<SetupResponse | SetupErrorResponse>> {
  const url = new URL(request.url)
  const themeQuery = url.searchParams.get('themes') || 'tally'
  const selectedThemes = themeQuery.split(',')

  try {
    const themesDir = path.join(process.cwd(), 'themes')
    const coreDir = path.join(process.cwd(), 'hooks')
    const utilsPath = path.join(
      process.cwd(),
      'components',
      'Utils',
      'utils.ts'
    ) // Path to your utils

    const files: SetupFile[] = []
    let indexCssContent = ''

    // 1. Process Themes (Targeting the 'core/' folder)
    for (const theme of selectedThemes) {
      const themeCss = await fs.readFile(
        path.join(themesDir, `${theme}.css`),
        'utf8'
      )
      files.push({ name: `core/styles/${theme}.css`, content: themeCss })
      indexCssContent += `@import './${theme}.css';\n`
    }

    // 2. Process Global CSS
    const globalCss = await fs.readFile(
      path.join(themesDir, 'global.css'),
      'utf8'
    )
    files.push({ name: 'core/styles/global.css', content: globalCss })
    indexCssContent += `@import './global.css';\n`

    // 3. Process the Theme Engine
    const themeProviderContent = await fs.readFile(
      path.join(coreDir, 'useTheme.tsx'),
      'utf8'
    )
    files.push({
      name: 'core/theme-provider.tsx',
      content: themeProviderContent,
    })

    // 4. THE UTILITIES INJECTION (Targeting the 'ui/' folder)
    const utilsContent = await fs.readFile(utilsPath, 'utf8')
    files.push({ name: `ui/Utils/utils.ts`, content: utilsContent })

    // 5. Base css.
    const baseCss = await fs.readFile(path.join(themesDir, 'base.css'), 'utf8')
    indexCssContent += `@import './base.css';\n`
    files.push({ name: 'core/styles/base.css', content: baseCss })
    files.push({ name: 'core/styles/index.css', content: indexCssContent })

    return NextResponse.json<SetupResponse>({
      // We must install these so the utils.ts file doesn't crash the user's app!
      packageDependencies: ['clsx', 'tailwind-merge'],
      files: files,
    })
  } catch (error) {
    console.error('Init API Error:', error)
    return NextResponse.json<SetupErrorResponse>(
      { error: 'Failed to assemble init files' },
      { status: 500 }
    )
  }
}
