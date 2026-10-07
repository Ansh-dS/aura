import { program } from 'commander'
import path from 'path'
import fs from 'fs-extra'
import { execSync } from 'child_process'
import inquirer from 'inquirer'
import { askUserQuestions, normalizeSelectedThemes } from './prompts.js'
import { writeSetupFiles, injectNoBlink } from '../utils/writers.js'
import { providersTemplate } from '../utils/strings.js'
import { chaeckUserEnvironment } from '../utils/guards.js'

interface RegistrySetupResponse {
  packageDependencies?: string[]
  files: Array<{
    name: string
    content: string
  }>
}

const REGISTRY_URL = 'https://aura-navy-psi.vercel.app/api/registry'

// Helper function to ask before destroying an existing core file
async function promptOverwrite(fileName: string): Promise<boolean> {
  const { overwrite } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'overwrite',
      message: `File '${fileName}' already exists. Would you like to overwrite it?`,
      default: false,
    },
  ])
  return overwrite
}

// Automatically detects whether the user prefers pnpm, yarn, bun, or npm
// first check inside package.json, if not found then pnpm-lock.yaml, then yarn.lock .........
// all these packages are at root.
function detectPackageManager(cwd: string) {
  const packageJsonPath = path.join(cwd, 'package.json')
  if (fs.pathExistsSync(packageJsonPath)) {
    const packageJson = fs.readJsonSync(packageJsonPath)
    if (typeof packageJson.packageManager === 'string') {
      if (packageJson.packageManager.startsWith('pnpm')) return 'pnpm add'
      if (packageJson.packageManager.startsWith('yarn')) return 'yarn add'
      if (packageJson.packageManager.startsWith('bun')) return 'bun add'
    }
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.optionalDependencies,
    }
    if (
      Object.values(dependencies).some(
        (version) => typeof version === 'string' && version.startsWith('link:')
      )
    ) {
      return 'pnpm add'
    }
  }
  if (fs.pathExistsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm add'
  if (fs.pathExistsSync(path.join(cwd, 'yarn.lock'))) return 'yarn add'
  if (
    fs.pathExistsSync(path.join(cwd, 'bun.lockb')) ||
    fs.pathExistsSync(path.join(cwd, 'bun.lock'))
  )
    return 'bun add'

  return 'npm install'
}

// 1.providing the opting weather to run the setup function or not.
export const setupCommand = program
  .command('setup')
  .description('Initialize the UI library in your project')
  .option(
    '-y, --yes',
    'Skip confirmation prompts and overwrite existing setup files'
  )
  .action(async (options) => {
    await chaeckUserEnvironment(process.cwd()) // checks weather we have both, Next.js and pnpm or not.
    console.log('🚀 Initializing Aurajet...\n')

    const forceOverwrite = options.yes || false

    try {
      // 1. Ask the user for their theme preferences
      const answers = await askUserQuestions()

      if (!answers.confirmInit) {
        console.log('Initialization cancelled.')
        return
      }

      // 2. Process their answers
      const selectedThemes = normalizeSelectedThemes(answers)
      const defaultTheme = selectedThemes[0] as string
      console.log(`\nUser chose themes: ${selectedThemes.join(', ')}`)

      const cwd = process.cwd()

      // 3. Environment Detection: Figure out if this is Next.js or Vite
      let framework = 'vite'
      let targetDir = path.join(cwd, 'src')
      let cssFileName = 'index.css'

      // Check for Next.js app router structures
      if (await fs.pathExists(path.join(cwd, 'app'))) {
        framework = 'next'
        targetDir = path.join(cwd, 'app')
        cssFileName = 'globals.css'
      } else if (await fs.pathExists(path.join(cwd, 'src', 'app'))) {
        framework = 'next'
        targetDir = path.join(cwd, 'src', 'app')
        cssFileName = 'globals.css'
      }

      // ensureDir: to create directory with mentioned path, if doesn't exists.
      await fs.ensureDir(targetDir)

      // Target directory for the core library components
      const componentsDir = path.join(cwd, 'src', 'components')
      await fs.ensureDir(componentsDir)

      // 4. Fetch the foundational templates from the live registry
      console.log(`\n⬇️ Fetching core engine and themes...`)
      const res = await fetch(
        `${REGISTRY_URL}/setup?themes=${selectedThemes.join(',')}`
      )

      if (!res.ok) {
        throw new Error('Failed to fetch setup data.')
      }

      const apiData = (await res.json()) as RegistrySetupResponse

      // Cleanup old config files if they exist from a legacy installation
      const configPath = path.join(cwd, 'ui-lib.config.json')
      if (await fs.pathExists(configPath)) {
        await fs.remove(configPath)
        console.log('ℹ️ Removed outdated ui-lib.config.json')
      }

      // 5. Build or Update the Core Architecture Files (CSS + utils.ts + theme-provider.tsx)
      const filesToWrite = []

      // Filter out files that already exist unless the user confirms the overwrite
      for (const file of apiData.files) {
        const fullPath = path.join(componentsDir, file.name)
        if (!forceOverwrite && (await fs.pathExists(fullPath))) {
          const shouldOverwrite = await promptOverwrite(file.name)
          if (shouldOverwrite) {
            filesToWrite.push(file)
          } else {
            console.log(`  ⏭️  Skipped '${file.name}'`)
          }
        } else {
          // File doesn't exist, or forceOverwrite is true
          filesToWrite.push(file)
        }
      }

      // Pass ONLY the confirmed files to the writer utility
      if (filesToWrite.length > 0) {
        const cssResult = await writeSetupFiles(
          componentsDir,
          targetDir,
          cssFileName,
          filesToWrite
        )
        console.log(
          `✔️ ${cssResult.created ? 'Created' : 'Updated'} modular CSS pipeline`
        )
      }

      // 6. Build the React Context Providers wrapper
      const isNext = framework === 'next'
      const providersPath = path.join(componentsDir, 'core', 'providers.tsx')
      let shouldWriteProviders = true

      // Overwrite protection for providers.tsx
      if (!forceOverwrite && (await fs.pathExists(providersPath))) {
        shouldWriteProviders = await promptOverwrite('core/providers.tsx')
      }

      if (shouldWriteProviders) {
        await fs.ensureDir(path.dirname(providersPath))
        await fs.writeFile(
          providersPath,
          providersTemplate(isNext, defaultTheme)
        )
        console.log('✔️ Providers generated: src/components/core/providers.tsx')
      } else {
        console.log(`  ⏭️  Skipped 'core/providers.tsx'`)
      }

      // 7. Inject the No-Blink script safely to prevent FOUC (Flash of unstyled content)
      try {
        const res = await injectNoBlink(targetDir, isNext, defaultTheme)
        if (res && res.injected) {
          console.log(`✔️ Injected no-blink script into: ${res.file}`)
        }
      } catch {
        console.warn('⚠️ Could not inject no-blink script automatically.')
      }

      // 8. Install required foundational dependencies (like next-themes, clsx, tailwind-merge)
      if (apiData.packageDependencies?.length) {
        console.log(
          `\n📦 Installing architecture dependencies: ${apiData.packageDependencies.join(', ')}...`
        )
        const installCommand = detectPackageManager(cwd)
        execSync(`${installCommand} ${apiData.packageDependencies.join(' ')}`, {
          stdio: 'inherit',
        })
      }

      // 9. Final Setup Instructions
      console.log('\n✨ Almost done! Complete your setup:')
      console.log(
        `1. Ensure Providers are imported in your ${isNext ? 'layout.tsx' : 'main.tsx'}:`
      )
      console.log(
        `   If not present, add: import Providers from '@/src/components/core/providers';`
      )
      console.log(
        `2. Confirm your ${cssFileName} imports the local styles folder automatically.\n`
      )
    } catch (err: unknown) {
      if (err instanceof Error && 'isTtyError' in err) {
        console.error("Prompt couldn't be rendered in the current environment.")
      } else {
        console.error('Something went wrong:', err)
      }
    }
  })
