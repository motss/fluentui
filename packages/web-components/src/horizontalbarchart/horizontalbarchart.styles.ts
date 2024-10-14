import type { ElementStyles } from '@microsoft/fast-element';
import { css } from '@microsoft/fast-element';
import {
  borderRadiusMedium,
  colorCompoundBrandStroke,
  colorNeutralBackground1,
  colorNeutralBackground3,
  colorNeutralBackgroundInverted,
  colorNeutralForeground1,
  colorNeutralForeground4,
  colorNeutralForegroundDisabled,
  colorNeutralForegroundInverted,
  colorNeutralStroke1,
  colorNeutralStroke1Hover,
  colorNeutralStroke1Pressed,
  colorNeutralStrokeAccessible,
  colorNeutralStrokeAccessibleHover,
  colorNeutralStrokeAccessiblePressed,
  colorNeutralStrokeDisabled,
  colorPaletteRedBorder2,
  colorTransparentBackground,
  curveAccelerateMid,
  curveDecelerateMid,
  durationNormal,
  durationUltraFast,
  fontFamilyBase,
  fontSizeBase200,
  fontSizeBase300,
  fontSizeBase400,
  fontWeightRegular,
  lineHeightBase200,
  lineHeightBase300,
  lineHeightBase400,
  shadow2,
  spacingHorizontalM,
  spacingHorizontalMNudge,
  spacingHorizontalSNudge,
  spacingHorizontalXS,
  spacingHorizontalXXS,
  spacingVerticalS,
  spacingVerticalSNudge,
  spacingVerticalXS,
  strokeWidthThin,
} from '../theme/design-tokens.js';
import { forcedColorsStylesheetBehavior } from '../utils/behaviors/match-media-stylesheet-behavior.js';
import { display } from '../utils/display.js';

/**
 * Styles for the HorizontalBarChart component.
 *
 * @public
 */
export const styles: ElementStyles = css`
  ${display('inline-block')}

  .root {
    background-color: var(--background-color);
    width: 100vw;
    display: flex;
    flex-direction: column;
  }
  .tooltip {
    position: absolute;
    display: grid;
    overflow: hidden;
    padding: 11px 16px 10px 16px;
    backgroundcolor: theme.semanticColors.bodyBackground;
    backgroundblendmode: normal, luminosity;
    text-align: center;
    font: 12px sans-serif;
    background: white;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
    border: 2px;
    pointer-events: none;
    opacity: 0;
    z-index: 999;
  }
  .chartTitle {
    display: flex;
    justify-content: space-between;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: block;
    color: theme.palette.neutralPrimary;
  }
`;
