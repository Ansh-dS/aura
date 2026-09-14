const sharedDeps = [
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
  'lucide-react',
]

// registryDependencies: In each component we are importing some pre-built components.
const registryIndex: Record<
  string,
  { packageDependencies: string[]; componentsDependencies?: string[] }
> = {
  alert: { packageDependencies: sharedDeps, componentsDependencies: [] },
  avatar: { packageDependencies: sharedDeps, componentsDependencies: [] },
  badge: { packageDependencies: sharedDeps, componentsDependencies: ['text'] },
  box: { packageDependencies: sharedDeps, componentsDependencies: [] },
  breadcrumb: { packageDependencies: sharedDeps, componentsDependencies: [] },
  button: {
    packageDependencies: sharedDeps,
    componentsDependencies: ['spinner', 'text'],
  },
  card: {
    packageDependencies: sharedDeps,
    componentsDependencies: ['text', 'box'],
  },
  checkbox: {
    packageDependencies: sharedDeps,
    componentsDependencies: ['text'],
  },
  datagrid: { packageDependencies: sharedDeps, componentsDependencies: [] },
  'data-grid': { packageDependencies: sharedDeps, componentsDependencies: [] },
  datalist: { packageDependencies: sharedDeps, componentsDependencies: [] },
  'data-list': { packageDependencies: sharedDeps, componentsDependencies: [] },
  dropdown: {
    packageDependencies: sharedDeps,
    componentsDependencies: ['box'],
  },
  'drop-down': {
    packageDependencies: sharedDeps,
    componentsDependencies: ['box'],
  },
  emptystate: {
    packageDependencies: sharedDeps,
    componentsDependencies: ['text'],
  },
  'empty-state': {
    packageDependencies: sharedDeps,
    componentsDependencies: ['text'],
  },
  errorboundary: {
    packageDependencies: sharedDeps,
    componentsDependencies: ['text', 'button'],
  },
  'error-boundary': {
    packageDependencies: sharedDeps,
    componentsDependencies: ['text', 'button'],
  },
  footer: { packageDependencies: sharedDeps, componentsDependencies: [] },
  header: { packageDependencies: sharedDeps, componentsDependencies: ['text'] },
  heading: { packageDependencies: sharedDeps, componentsDependencies: [] },
  input: { packageDependencies: sharedDeps, componentsDependencies: [] },
  label: { packageDependencies: sharedDeps, componentsDependencies: [] },
  modal: { packageDependencies: sharedDeps, componentsDependencies: [] },
  networkhealthindicator: {
    packageDependencies: sharedDeps,
    componentsDependencies: [],
  },
  'network-health-indicator': {
    packageDependencies: sharedDeps,
    componentsDependencies: [],
  },
  popover: { packageDependencies: sharedDeps, componentsDependencies: [] },
  progressbar: { packageDependencies: sharedDeps, componentsDependencies: [] },
  'progress-bar': {
    packageDependencies: sharedDeps,
    componentsDependencies: [],
  },
  radio: { packageDependencies: sharedDeps, componentsDependencies: ['text'] },
  select: { packageDependencies: sharedDeps, componentsDependencies: [] },
  sheet: { packageDependencies: sharedDeps, componentsDependencies: [] },
  sidebar: {
    packageDependencies: sharedDeps,
    componentsDependencies: [
      'error-boundary',
      'button',
      'box',
      'stack',
      'text',
    ],
  },
  socialbutton: {
    packageDependencies: sharedDeps,
    componentsDependencies: ['text'],
  },
  'social-button': {
    packageDependencies: sharedDeps,
    componentsDependencies: ['text'],
  },
  sortable: {
    packageDependencies: sharedDeps,
    componentsDependencies: ['box', 'stack', 'button'],
  },
  spinner: { packageDependencies: sharedDeps, componentsDependencies: [] },
  stack: { packageDependencies: sharedDeps, componentsDependencies: [] },
  stat: { packageDependencies: sharedDeps, componentsDependencies: ['text'] },
  switch: { packageDependencies: sharedDeps, componentsDependencies: ['text'] },
  tabs: {
    packageDependencies: sharedDeps,
    componentsDependencies: ['box', 'stack', 'button'],
  },
  text: { packageDependencies: sharedDeps, componentsDependencies: [] },
  textarea: { packageDependencies: sharedDeps, componentsDependencies: [] },
  'text-area': { packageDependencies: sharedDeps, componentsDependencies: [] },
  toastprovider: {
    packageDependencies: sharedDeps,
    componentsDependencies: ['box', 'stack', 'text', 'button'],
  },
  'toast-provider': {
    packageDependencies: sharedDeps,
    componentsDependencies: ['box', 'stack', 'text', 'button'],
  },
  tooltip: {
    packageDependencies: sharedDeps,
    componentsDependencies: ['text'],
  },
}

export default registryIndex
