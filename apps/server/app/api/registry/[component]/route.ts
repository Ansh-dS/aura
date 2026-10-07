import fs from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server.js'
import registryIndex from '@registry'

// increases the starting charcter of each string/component to uppercase.
function toPascalCase(componentName: string) {
  return componentName
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

export interface RegistryFile {
  path: string // e.g., "Button/Button.tsx"
  name: string
  content: string // The actual data.
}

export interface RegistryResponse {
  name: string
  packageDependencies: string[]
  componentsDependencies: string[]
  files: RegistryFile[]
}

export interface ErrorResponse {
  error: string
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ component: string }> }
): Promise<NextResponse<RegistryResponse | ErrorResponse>> {
  const resolvedParams = await params
  const componentName = resolvedParams.component.toLowerCase()
  const folderName = toPascalCase(componentName)
  const meta = registryIndex[componentName] // {packages needed , other comoponent needed to run current component. }

  if (!meta) {
    return NextResponse.json<ErrorResponse>(
      { error: `Component '${componentName}' not found in registry.` },
      { status: 404 }
    )
  }

  try {
    const componentPath = path.join(process.cwd(), 'components', folderName)
    const files: RegistryFile[] = []

    // Entiries have styles.css file and componentName.tsx file.
    const entries = await fs.readdir(componentPath, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = path.join(componentPath, entry.name)
        const content = await fs.readFile(filePath, 'utf8')

        //
        files.push({
          path: path.join(folderName, entry.name), // e.g., "Button/Button.tsx"
          name: entry.name,
          content,
        })
      }
    }

    // Return the specific files AND the instructions on what other internal components are required
    return NextResponse.json<RegistryResponse>({
      name: componentName,
      packageDependencies: meta.packageDependencies,
      componentsDependencies: meta.componentsDependencies || [], // Hand relationship tracking down to CLI
      files,
    })
  } catch (error) {
    console.error(`Registry engine error for ${folderName}:`, error)
    return NextResponse.json<ErrorResponse>(
      { error: `Failed to assemble assets for ${folderName}.` },
      { status: 500 }
    )
  }
}
