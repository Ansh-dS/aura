import { execa } from 'execa'
import fs from 'fs/promises'
import path from 'path'

export async function verifyPnpmInstalled(): Promise<boolean> {
  try {
    // execa helps us to run shell/ terminal commands using node.
    await execa('pnpm', ['--version'])
    return true
  } catch {
    return false
  }
}

export async function verifyNextJsProject(cwd: string): Promise<boolean> {
  try {
    const pkgPath = path.join(cwd, 'package.json')
    const pkgContent = await fs.readFile(pkgPath, 'utf-8')
    const pkg = JSON.parse(pkgContent)

    if (pkg.dependencies?.next || pkg.devDependencies?.next) {
      return true
    }
    return false
  } catch {
    return false
  }
}

export async function chaeckUserEnvironment(cwd: string) {
  const isPnpmInstalled = await verifyPnpmInstalled()
  if (!isPnpmInstalled) {
    console.error(
      '❌ Aura UI requires pnpm to manage dependencies. Please install it globally: npm install -g pnpm'
    )
    process.exit(1)
  }

  const isNextJs = await verifyNextJsProject(cwd)
  if (!isNextJs) {
    console.error(
      '🛑 Unsupported Framework Detected. Aura UI currently only supports Next.js projects.'
    )
    process.exit(1)
  }
}
