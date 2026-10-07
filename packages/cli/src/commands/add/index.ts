import { Command } from 'commander'
import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'
import inquirer from 'inquirer' // Added inquirer for prompts
import { chaeckUserEnvironment } from '../utils/guards.js'
interface RegistryFile {
  path: string
  content: string
}

interface RegistryComponentResponse {
  packageDependencies?: string[]
  componentsDependencies?: string[]
  files: RegistryFile[]
}

const REGISTRY_URL = 'https://aura-navy-psi.vercel.app/api/registry'

// 1. Helper to ask the user before destroying their hard work
async function promptOverwrite(componentName: string): Promise<boolean> {
  const { overwrite } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'overwrite',
      message: `Component '${componentName}' already exists. Would you like to overwrite it?`,
      default: false,
    },
  ])
  return overwrite
}

// Helper to handle writing/injecting files to target directory
async function writingFiles(
  files: RegistryFile[],
  targetDir: string,
  shouldWrite: boolean,
  folderName: string
): Promise<void> {
  if (shouldWrite) {
    for (const file of files) {
      const destPath = path.join(targetDir, file.path)
      await fs.ensureDir(path.dirname(destPath))
      await fs.writeFile(destPath, file.content)
      console.log(`  ✔ Injected ${file.path}`)
    }
  } else {
    console.log(`  ⏭️  Skipped '${folderName}' (Kept custom modifications)`)
  }
}

// 2. Recursive function to download a component and all of its sub-components
// Also add all pnpm-dependencies into a set, so we can install all dependencies after installing all needed components.
async function downloadComponentTree(
  componentName: string,
  targetDir: string,
  downloaded: Set<string>,
  allNpmDeps: Set<string>,
  forceOverwrite: boolean // Added overwrite flag
) {
  const normalizedName = componentName.toLowerCase()

  // Guard clause: Don't re-download something we already grabbed in this session
  if (downloaded.has(normalizedName)) return

  downloaded.add(normalizedName)

  // Fetch the component payload from the Next.js API
  const response = await fetch(`${REGISTRY_URL}/${normalizedName}`)
  if (!response.ok) {
    console.error(
      `❌ Sub-component '${componentName}' could not be resolved by the registry.`
    )
    return
  }

  const data = (await response.json()) as RegistryComponentResponse

  if (!data.files || data.files.length === 0) {
    console.error(
      `❌ Component '${componentName}' has no files in the registry.`
    )
    return
  }

  // 3. Overwrite Protection Logic
  // Safely extract the folder name from the first file path (e.g., "Button" from "Button/Button.tsx")
  const folderName = data.files[0]!.path.split('/')[0] || ''
  if (!folderName) {
    console.error(`❌ Invalid file structure for component '${componentName}'.`)
    return
  }
  const componentDirPath = path.join(targetDir, folderName)

  let shouldWrite = true

  // If the folder exists, and the user didn't use the --yes flag, ask them!
  if (!forceOverwrite && (await fs.pathExists(componentDirPath))) {
    shouldWrite = await promptOverwrite(folderName)
  }

  // 4. Inject Files (or skip if user said no)
  await writingFiles(data.files, targetDir, shouldWrite, folderName)

  // 5. Track its NPM dependencies to install them all at once at the end
  if (data.packageDependencies) {
    data.packageDependencies.forEach((dep: string) => allNpmDeps.add(dep))
  }

  // 6. RECURSION FLUIDITY: If this component depends on other internal components, fetch them now!
  if (data.componentsDependencies && data.componentsDependencies.length > 0) {
    for (const subComponent of data.componentsDependencies) {
      await downloadComponentTree(
        subComponent,
        targetDir,
        downloaded,
        allNpmDeps,
        forceOverwrite
      )
    }
  }
}

export const addCommand = new Command()
  // Changed from <component> to [components...] to allow an array of inputs!
  .command('add [components...]')
  .description('Download and inject components and their internal dependencies')
  // Added a --yes flag so CI/CD pipelines or confident users can skip prompts
  .option(
    '-y, --yes',
    'Skip confirmation prompts and overwrite existing components'
  )
  .action(async (components: string[], options) => {
    await chaeckUserEnvironment(process.cwd())
    // Fallback if the user types `pnpm aurajet add` without specifying a component
    if (!components || components.length === 0) {
      console.error(
        '\n❌ Please specify at least one component to add. (e.g., pnpm aura add button card)\n'
      )
      return
    }

    const cwd = process.cwd()
    const targetDir = path.join(cwd, 'src', 'components', 'ui')
    await fs.ensureDir(targetDir)

    const downloadedComponents = new Set<string>()
    const accumulatedNpmDeps = new Set<string>()
    const forceOverwrite = options.yes || false

    // Loop through every component the user requested
    for (const comp of components) {
      console.log(`\n🚀 Processing '${comp}'...`)

      try {
        await downloadComponentTree(
          comp,
          targetDir,
          downloadedComponents,
          accumulatedNpmDeps,
          forceOverwrite
        )
      } catch (error) {
        console.error(
          `\n❌ Failed to execute component tree injection for ${comp}:`,
          error
        )
      }
    }

    // Install all accumulated NPM packages collectively to keep installation fast
    if (accumulatedNpmDeps.size > 0) {
      const depList = Array.from(accumulatedNpmDeps).join(' ')
      console.log(`\n📦 Installing architecture peer dependencies...`)
      execSync(`pnpm add ${depList}`, { stdio: 'inherit' })
    }

    console.log(`\n✨ Successfully finished adding components!`)
  })
