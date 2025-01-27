export const design = {
  colors: {
    primary: {
      DEFAULT: '#30035e',
      hover: '#30035e/90',
      light: '#f6efff',
    },
    secondary: {
      DEFAULT: '#f9a8c9',
      hover: '#f9a8c9/90',
    },
    gray: {
      100: '#f3f4f6',
    }
  },
  spacing: {
    card: 'p-6',
    section: 'space-y-4',
    element: 'space-y-2',
    inline: 'gap-2'
  },
  typography: {
    title: 'text-lg font-semibold text-[#30035e]',
    subtitle: 'text-sm text-muted-foreground',
    label: 'text-sm font-medium',
    input: 'text-base',
  },
  layout: {
    card: 'w-full max-w-xl',
    container: 'space-y-4',
    header: 'flex items-center justify-between mb-6',
    headerContent: 'space-y-1',
  },
  components: {
    button: {
      primary: 'bg-[#30035e] hover:bg-[#30035e]/90 text-white',
      outline: 'border-[#30035e] text-[#30035e] hover:bg-[#30035e]/10',
      ghost: 'hover:bg-[#f6efff]/50',
      icon: 'h-8 w-8',
      iconSize: 'h-4 w-4',
    },
    input: {
      base: 'h-10 focus-visible:ring-[#30035e]',
    },
    listItem: {
      base: 'group flex items-center justify-between p-3 hover:bg-[#f6efff]/50 rounded-md transition-colors border',
      icon: 'h-4 w-4 text-[#f9a8c9]',
    },
    dialog: {
      content: 'sm:max-w-[425px]',
      body: 'grid gap-4 py-4',
    }
  },
  animations: {
    transition: 'transition-all duration-200',
    listItem: {
      initial: { opacity: 0, height: 0 },
      animate: { opacity: 1, height: "auto" },
      exit: { opacity: 0, height: 0 },
    }
  }
} as const

export type DesignSystem = typeof design 