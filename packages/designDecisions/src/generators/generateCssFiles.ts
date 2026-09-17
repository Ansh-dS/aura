import path from 'path'
import { readdir, access, constants, writeFile } from 'fs/promises'
import stringCss from './generateCssInStringType.js'
import { DesignSystem } from '../tokenDefinition.js'
import { pathToFileURL } from 'url'
import { mkdirSync } from 'fs'

const packageRoot = process.cwd()
const workspaceRoot = path.resolve(packageRoot, '..', '..') // resolve: takes sequence of path and return absolute path.

/**
 * 1. createCssFile
 * Compiles a design token object into a flattened CSS variable string
 * and writes the compiled CSS stylesheet to the server's public theme assets.
 */
async function createCssFile(
  themeContent: DesignSystem,
  themeName: string
): Promise<void> {
  //  file saves with a .css extension
  const createCssHere = path.join(
    workspaceRoot,
    'apps/server/themes',
    `${themeName}.css`
  )

  const css = stringCss(themeContent, themeName)

  try {
    //  Ensuring the directory exists before trying to write to it
    mkdirSync(path.dirname(createCssHere), { recursive: true })

    // writeFile is async where as writeFileSync is synchronous.
    await writeFile(createCssHere, css, 'utf-8')
    console.log(`Created successfully ${createCssHere}`)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

/**
 * 2. processTokensFolder
 * Reads all files from the chosen tokens folder, filters out declaration files(as we are reading from dist folder.),
 * normalizes theme names (deduplicating base vs suffix names), dynamically imports
 * each module, and initiates the CSS file compilation.
 */
async function processTokensFolder(
  folderPath: string,
  allowTs: boolean = false
) {
  try {
    // readdir: Read all entries in the folder. output=> array.
    // { withFileTypes: true }: provides metadata, so we can directly check whether it’s a file, directory, symbolic link
    const entries = await readdir(folderPath, { withFileTypes: true })

    // Filter only target theme files based on allowTs flag (excluding directories/readme)
    const files = entries.filter((entry) => {
      if (!entry.isFile()) return false
      return allowTs
        ? entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')
        : entry.name.endsWith('.js')
    })

    // Build a map of normalized theme names -> {file destination(Path), file name information }
    // Normalization: strip a trailing `Theme` suffix (case-insensitive).
    // When both `foo.js` and `fooTheme.js` exist, prefer the base `foo.js` file.
    const fileMap = new Map<
      string,
      { fullPath: string; origName: string; isThemeSuffix: boolean }
    >()

    files.forEach((file) => {
      const fullPath = path.join(folderPath, file.name)
      const ext = path.extname(file.name) // returns extention of the file.
      const base = path.basename(file.name, ext)
      const normalized = base.replace(/Theme$/i, '')
      // checks weather base ends with 'theme' or not.
      const isTheme = /Theme$/i.test(base)

      const existing = fileMap.get(normalized)

      // Streamlined Logic: Prefer the non-Theme file over a Theme-suffixed file
      if (!existing || (existing.isThemeSuffix && !isTheme)) {
        fileMap.set(normalized, {
          fullPath,
          origName: file.name,
          isThemeSuffix: isTheme,
        })
      }
    })

    // Process the selected unique files
    await Promise.all(
      Array.from(fileMap.entries()).map(async ([themeName, entry]) => {
        const fullPath = entry.fullPath
        const ext = path.extname(fullPath)

        if (ext === '.js' || (ext === '.ts' && allowTs)) {
          try {
            const tokenModule = await import(pathToFileURL(fullPath).href)
            const jsonToken = tokenModule?.default ?? tokenModule

            if (jsonToken) {
              await createCssFile(jsonToken, themeName)
            }
          } catch (e) {
            console.warn(
              `Skipping file due to import error: ${entry.origName}`,
              e
            )
          }
        }
      })
    )

    console.log('processFolder: All files processed successfully')
  } catch (err) {
    console.error('Error processing folder:', err)
  }
}

/**
 * 3. generateCssFiles
 * The entry orchestrator function. Checks if compiled tokens (in dist) or
 * source tokens (in src) are available, selects the target path, and triggers
 * the folder processing to generate the CSS files.
 */
async function generateCssFiles() {
  const distTokensPath = path.join(packageRoot, 'dist/src/tokens')
  const srcTokensPath = path.join(packageRoot, 'src/tokens')

  let selectedPath: string | null = null
  let allowTs = false

  // finding correct selectedPath out of dist and tokens and to allow '.ts' files or not
  try {
    // access and contants: checks does the file exists or not.
    await access(distTokensPath, constants.F_OK)
    selectedPath = distTokensPath
    allowTs = false // compiled dist contains only .js files (and .d.ts files)
    console.log('Using tokens from dist:', distTokensPath)
  } catch {
    try {
      console.log('not taking dist path')
      await access(srcTokensPath, constants.F_OK)
      selectedPath = srcTokensPath
      allowTs = true // source folder contains .ts files
      console.log('Using tokens from src:', srcTokensPath)
    } catch {
      console.error('No tokens folder found in dist or src')
      console.log(
        'Build the package (tsc -b) first so tokens are compiled to dist/src/tokens'
      )
      process.exit(1)
    }
  }

  await processTokensFolder(selectedPath, allowTs)
}

generateCssFiles()
