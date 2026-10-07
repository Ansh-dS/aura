<div align="center">
  <br />
  <h1>⚡ Aura UI</h1>
  <p>
    <strong>A theme-agnostic, heavily optimized design architecture that shifts the focus from "Widgets" to "Systems."</strong>
  </p>
  <br />

  <!-- Badges -->
  <p>
    <a href="https://github.com/Ansh-dS/aura/actions"><img src="https://img.shields.io/github/actions/workflow/status/Ansh-dS/aura/ci.yml?style=flat-square" alt="Build Status"></a>
    <a href="https://www.npmjs.com/package/go-aura"><img src="https://img.shields.io/npm/v/go-aura?style=flat-square&color=blue" alt="NPM Version"></a>
    <a href="https://github.com/Ansh-dS/aura/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Ansh-dS/aura?style=flat-square" alt="License"></a>
    <a href="https://github.com/Ansh-dS/aura/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome"></a>
  </p>
</div>

<hr />

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [System Architecture](#-system-architecture)
- [Local Development](#-local-development)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 About The Project

Aura UI provides centralized, natively performant components distributed via a serverless Edge registry. Download components directly into your local codebase—they instantly inherit your global brand rules with **zero React re-renders** and **zero third-party animation bloat**.

Unlike traditional UI libraries packaged as heavy npm modules, Aura acts as an intelligent scaffold. The code you need is injected directly into your source repository, granting you 100% control over the underlying logic, styles, and markup.

## ✨ Features

- **Zero React Re-renders:** Driven natively by CSS custom properties.
- **Decoupled Architecture:** Components, CLI, and design tokens operate independently.
- **Instant White-Labeling:** Change your root CSS theme file and the entire project updates.
- **CLI-Driven Injection:** Download raw `.tsx` files directly into your project via the terminal.
- **Zero Animation Bloat:** Complex state transitions are hand-coded using native Tailwind physics.
- **Accessible & Type-Safe:** Built with strict TypeScript contracts and accessible ARIA standards.

## 📦 Prerequisites

Ensure you have the following installed before using the CLI or developing locally:

- **Node.js**: `v20.x` or higher
- **Package Manager**: [pnpm](https://pnpm.io/) (v9.0.0+) is highly recommended.
- **Framework**: A React-based framework configured with **Tailwind CSS**.

## 🚀 Quick Start

Stop manually painting individual UI elements. Set up the initialization engine in your workspace:

### 1. Initialize Aura

Run the setup wizard to configure the `components.json` registry map in your project:

```bash
pnpm aura setup
```

### 2. Add Components

Deploy a smart architectural component directly from the Vercel registry into your local codebase:

```bash
pnpm aura add button
```

### 3. Use in your App

```tsx
import { Button } from '@/components/ui/Button'

export default function App() {
  return <Button variant="primary">Click Me</Button>
}
```

## 🏗️ System Architecture

Aura UI is built as a high-velocity Turborepo monorepo. The architecture is decoupled to ensure clean internal linkage without requiring complex npm organizational scopes.

### 1. The Monorepo Infrastructure

Turborepo orchestrates tasks and zero-install caching, while the Next.js Vercel Edge Network handles serverless component distribution.

- **`pnpm-workspace.yaml`**: Declares the monorepo structure, linking `apps/*` and `packages/*`.
- **`apps/server/next.config.ts`**: Uses `outputFileTracingIncludes` to forcefully bundle dynamic component and theme directories, preventing serverless tree-shaking from pruning them during the Edge build phase.
- **`turbo.json`**: Defines the build execution graph and includes a unified clean task to safely wipe stale build artifacts simultaneously.

### 2. The Design Token Engine

The token system handles theme compilation completely independently of PostCSS. Developers edit core design tokens, and the generator script executes, outputting compiled CSS files directly to the server.

- **`packages/designDecisions/`**: The isolated engine handling theme compilation (`generateCssFiles.ts` & `stringCss.ts`).
- **`apps/server/themes/*.css`**: The destination stylesheets (e.g., `global.css`, `riverside.css`) making the compiled tokens available for the CLI to distribute.

### 3. Core UI & Documentation

Because components are raw `.tsx` files in the server directory, Vite-powered Storybook reads them directly via workspace mapping, providing lightning-fast hot-reloading.

- **`apps/server/components/`**: The raw React structural templates and variant physics (using CVA).
- **`apps/storybook/src/stories/`**: Interactive implementation documentation for every component.

### 4. Complex UI Engineering

Advanced components (Popovers, Tabs, DataGrids) deeply utilize compound component patterns and advanced React context architectures.

- **Native Tailwind Physics:** Complex transition states are defined directly in `styles.ts` CVA using native utilities (e.g., `translate-y-4`, `opacity-0`).
- **Strict TypeScript Contracts:** Types are extracted directly from CVA (`VariantProps<typeof popoverVariants>`).

### 5. The CLI Network Engine

The CLI makes secure fetch requests to the serverless endpoint (e.g., `https://aura-server.vercel.app/api/registry/button`). The endpoint streams the raw `.tsx` and `.ts` string files back, and Node's file system API injects them perfectly into the consumer's local source directory.

- **`packages/cli/bin/aura-init.js`**: The executable entry point for the `go-aura` command.
- **`packages/cli/src/commands/add`**: The network engine leveraging the native Fetch API to download components dynamically.

## 🛠️ Local Development

Clone the repository and install dependencies using `pnpm`:

```bash
git clone https://github.com/Ansh-dS/aura.git
cd aura
pnpm install
```

### Common Commands

Start the interactive Storybook environment to visually test components locally:

```bash
pnpm turbo run dev --filter=aura-storybook
```

Build all packages and prepare for deployment:

```bash
pnpm build
```

Run linting across the monorepo:

```bash
pnpm lint
```

## 🗺️ Roadmap

- [x] Initial CLI architecture and Vercel Edge registry
- [x] Core token generation engine
- [x] Baseline interactive components (Button, Input, Dropdown, etc.)
- [ ] Add more complex layout components (DataGrid enhancements, Charts)
- [ ] Comprehensive automated test suite
- [ ] Framework-agnostic adaptors (Vue, Svelte)

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure your code adheres to the existing formatting and TypeScript standards by running `pnpm lint` and `pnpm check-errors` before submitting.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Engineered and architected by <b>Anshdeep Singh</b> as a Cohort 2.0 milestone at IIT Patna.</p>
</div>
