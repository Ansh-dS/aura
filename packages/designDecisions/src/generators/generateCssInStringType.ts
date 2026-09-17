// while flatten if key gets 'abc' then add xyz in array and move to the next value.

// returns css variables as string value for different theme
import { DesignSystem } from '../tokenDefinition.js'

// Recursively process tokens
// output array having key value pair.
/*
      intution: 
          1.if the "value" is an object then we again need to open it(value) into key-value pair using loop.
          2.so we are using recursion.

      parent key: 
          we are updating it each time as the value of tokenName becomes new parent key.
          we are updating it using parameters of recurrsion. 
       */
function flattenTokens(
  obj: object,
  parentKey: string = ''
): Array<[string, string | number]> {
  // store
  const result: Array<[string, string | number]> = []

  Object.entries(obj).forEach(([key, value]) => {
    const tokenName = parentKey ? `${parentKey}-${key}` : key

    if (value == null) {
      return
    }

    // Check if the current key matches 'abc', inject 'xyz', and move to the next item
    if (key === 'abc') {
      result.push([tokenName, 'xyz'])
      return
    }

    if (key === 'fontSmoothing' && value === true) {
      result.push(
        ['-webkit-font-smoothing', 'antialiased'],
        ['-moz-osx-font-smoothing', 'grayscale']
      )
      return
    }
    // If value is an object (nested), recurse
    if (typeof value === 'object' && !Array.isArray(value)) {
      result.push(...flattenTokens(value, tokenName))
    }
    // If value is a primitive (string/number), add to result
    else if (typeof value === 'string' || typeof value === 'number') {
      result.push([tokenName, value])
    }
  })

  return result
}

// providing the css in string type for both light and dark modes
export default function stringCss(
  designToken: DesignSystem,
  themeName: string
): string {
  // Normalize token if it's wrapped (e.g. import default)
  // and guard missing properties to avoid runtime errors
  const tokenObj =
    (designToken as unknown as { default?: DesignSystem }).default ??
    designToken
  const commonVal = tokenObj?.global ?? {}
  // both modes may or may not exist.
  const lightVal = tokenObj?.modes?.light ?? {}
  const darkVal = tokenObj?.modes?.dark ?? {}

  // reverting the back output into json object.
  return (
    buildSection(`:root[data-theme-name="${themeName}"]`, commonVal) +
    buildSection(
      `:root[data-theme-name="${themeName}"][data-mode="light"]`,
      lightVal
    ) +
    buildSection(
      `:root[data-theme-name="${themeName}"][data-mode="dark"]`,
      darkVal
    )
  )
}

// Helper function to build formatted CSS rule declarations cleanly
function buildSection(selector: string, tokens: object): string {
  const rules = flattenTokens(tokens)
    .map(
      ([name, val]) => `  ${name.startsWith('-') ? '' : '--'}${name}: ${val};`
    )
    .join('\n')
  return `${selector} {\n${rules}${rules ? '\n' : ''}}\n`
}
