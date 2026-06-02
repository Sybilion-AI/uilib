/** @typedef {{ title: string, paths: string[] }} GlossaryProfile */

/** Paths relative to uilib `src/`. */
export const PROFILES = {
  content: {
    title: 'Sybilion page content glossary (content profile)',
    paths: [
      'components/ui/Page/AGENT.md',
      'components/ui/ChartAreaInteractive/AGENT.md',
      'components/widgets/DriverMap/AGENT.md',
      'components/widgets/PerformanceChart/AGENT.md',
      'components/widgets/DriversComparisonChart/AGENT.md',
    ],
  },
  workspace: {
    title: 'Sybilion workspace page glossary (workspace profile)',
    paths: [
      'components/ui/Page/AGENT.md',
      'components/widgets/SidebarDatasetsItemsGrouped/AGENT.md',
      'components/ui/ChartAreaInteractive/AGENT.md',
      'components/widgets/DriverMap/AGENT.md',
      'components/widgets/PerformanceChart/AGENT.md',
      'components/widgets/DriversComparisonChart/AGENT.md',
    ],
  },
};
