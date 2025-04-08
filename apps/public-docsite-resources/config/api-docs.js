// @ts-check
// Config file for API doc JSON (*.page.json) generation

const fs = require('fs');
const path = require('path');
const { findRepoDeps, findGitRoot } = require('@fluentui/scripts-monorepo');

const gitRoot = findGitRoot();

/** @type {import('@fluentui/api-docs').IPageJsonOptions} */
module.exports = {
  apiJsonPaths: [
    'packages/react',
    ...findRepoDeps({ cwd: path.join(gitRoot, 'packages/react'), dev: false }).map(dep => dep.packagePath),
    'packages/charts/react-charting',
  ]
    .map(packagePath => path.join(gitRoot, packagePath, 'dist', path.basename(packagePath) + '.api.json'))
    .filter(apiJsonPath => fs.existsSync(apiJsonPath)),
  min: process.argv.includes('--production'),
  outputRoot: path.resolve(__dirname, '../dist/api'),
  fallbackGroup: 'references',
  pageGroups: {
    react: [
      'ActivityItem',
      'Announced',
      'Breadcrumb',
      'Button',
      'Calendar',
      'Callout',
      'Checkbox',
      'ChoiceGroup',
      'Coachmark',
      'ColorPicker',
      'ComboBox',
      'CommandBar',
      'ContextualMenu',
      'DatePicker',
      'DetailsList',
      'Dialog',
      'Divider',
      'DocumentCard',
      'Dropdown',
      'ExtendedPeoplePicker',
      'ExtendedPicker',
      'Facepile',
      'FloatingPeoplePicker',
      'FloatingPicker',
      'FocusTrapZone',
      'FocusZone',
      'GroupedList',
      'HoverCard',
      'Icon',
      'Image',
      'Keytips',
      'Label',
      'Layer',
      'Link',
      'List',
      'MarqueeSelection',
      'MessageBar',
      'Modal',
      'Nav',
      'OverflowSet',
      'Overlay',
      'Panel',
      'PeoplePicker',
      'Persona',
      'Pickers',
      'Pivot',
      'Popup',
      'ProgressIndicator',
      'Rating',
      'ResizeGroup',
      'SelectedPeopleList',
      'Separator',
      'ScrollablePane',
      'SearchBox',
      'SelectableOption',
      'SelectedItemsList',
      'Shimmer',
      'Slider',
      'SpinButton',
      'Spinner',
      'Stack',
      'SwatchColorPicker',
      'TeachingBubble',
      'Text',
      'TextField',
      'TimePicker',
      'Toggle',
      'Tooltip',
    ],
    'react-charting': [
      'Legends',
      'LineChart',
      'AreaChart',
      'DonutChart',
      'VerticalBarChart',
      'GroupedVerticalBarChart',
      'HeatMapChart',
      'HorizontalBarChart',
      'HorizontalBarChartWithAxis',
      'PieChart',
      'GaugeChart',
      'SankeyChart',
      'SparklineChart',
      'StackedBarChart',
      'MultiStackedBarChart',
      'TreeChart',
      'VerticalStackedBarChart',
    ],
  },
};
