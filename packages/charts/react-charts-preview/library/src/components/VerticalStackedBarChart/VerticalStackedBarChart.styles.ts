import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { VerticalStackedBarChartProps, VerticalStackedBarChartStyles } from './VerticalStackedBarChart.types';
import { SlotClassNames } from '@fluentui/react-utilities/src/index';
import { tokens, typographyStyles } from '@fluentui/react-theme';

export const verticalstackedbarchartClassNames: SlotClassNames<VerticalStackedBarChartStyles> = {
  opacityChangeOnHover: 'fui-vsbc**opacityChangeOnHover',
  tooltip: 'fui-vsbc**tooltip',
  barLabel: 'fui-vsbc**barLabel',
  root: '',
};

const useStyles = makeStyles({
  opacityChangeOnHover: {
    cursor: 'default',
  },
  tooltip: {
    ...typographyStyles.body1,
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(tokens.spacingHorizontalS),
    position: 'absolute',
    textAlign: 'center',
    top: tokens.spacingVerticalNone,
    fill: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusSmall,
    pointerEvents: 'none',
  },
  barLabel: {
    ...typographyStyles.caption1Strong,
    fill: tokens.colorNeutralForeground1,
  },
});

export const useVerticalStackedBarChartStyles_unstable = (props: VerticalStackedBarChartProps): VerticalStackedBarChartStyles => {
  const baseStyles = useStyles();

  return {
    opacityChangeOnHover: mergeClasses(
      verticalstackedbarchartClassNames.opacityChangeOnHover,
      baseStyles.opacityChangeOnHover,
      props.href ? 'cursor-pointer' : ''
    ),
    tooltip: mergeClasses(verticalstackedbarchartClassNames.tooltip, baseStyles.tooltip),
    barLabel: mergeClasses(verticalstackedbarchartClassNames.barLabel, baseStyles.barLabel),
  };
};
