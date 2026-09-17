import inquirer from 'inquirer'

export type Answers = {
  confirmInit: boolean
  selectedThemes?: string[] | undefined
  framework: 'Next.js'
  packageManager: 'pnpm'
}

const options = ['tally', 'riverside']

export async function askUserQuestions(): Promise<Answers> {
  const responses = await inquirer.prompt<{
    confirmInit: boolean
    selectedThemes?: string[]
  }>([
    {
      name: 'confirmInit',
      type: 'confirm',
      message: 'Do you want to initialize the UI library here?',
      default: true,
    },
    {
      name: 'selectedThemes',
      type: 'checkbox',
      message:
        'Select the themes you want to include (Space to select, Enter to confirm):',
      choices: options,
      default: ['tally'],
      when: (answers) => answers.confirmInit,
      validate: (answer: string[]) =>
        answer.length > 0 ? true : 'You must choose at least one theme.',
    },
  ])

  return {
    ...responses,
    framework: 'Next.js',
    packageManager: 'pnpm',
  }
}

// return array of selected themes or ['tally'] from 'answers' given by user.
export function normalizeSelectedThemes(answers: Answers): string[] {
  if (answers.selectedThemes && answers.selectedThemes.length > 0) {
    return answers.selectedThemes
  }
  return ['tally']
}
