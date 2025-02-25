import { FocusZoneDirection } from '@fluentui/react-focus';
import { DirectionalHint } from '@fluentui/react/lib/Callout';
import { IPalette, IProcessedStyleSet } from '@fluentui/react/lib/Styling';
import {
  classNamesFunction,
  getId,
  getRTL,
  initializeComponentRef,
  memoizeFunction,
  warnDeprecations,
} from '@fluentui/react/lib/Utilities';
import { max as d3Max, min as d3Min } from 'd3-array';
import { Axis as D3Axis } from 'd3-axis';
import {
  scaleBand as d3ScaleBand,
  scaleLinear as d3ScaleLinear,
  ScaleLinear as D3ScaleLinear,
  scaleTime as d3ScaleTime,
  scaleUtc as d3ScaleUtc,
} from 'd3-scale';
import { select as d3Select } from 'd3-selection';
import * as React from 'react';
import {
  CartesianChart,
  ChartHoverCard,
  IAccessibilityProps,
  IBasestate,
  IChildProps,
  IDataPoint,
  ILineDataInVerticalStackedBarChart,
  IMargins,
  IModifiedCartesianChartProps,
  IVerticalStackedBarChartProps,
  IVerticalStackedBarChartStyleProps,
  IVerticalStackedBarChartStyles,
  IVerticalStackedBarDataPoint,
  IVerticalStackedChartProps,
  IVSChartDataPoint,
} from '../../index';
import { IChart } from '../../types/index';
import {
  areArraysEqual,
  calculateAppropriateBarWidth,
  calculateLongestLabelWidth,
  ChartTypes,
  createNumericYAxis,
  createStringYAxis,
  domainRangeOfDateForAreaLineVerticalBarChart,
  domainRangeOfVSBCNumeric,
  domainRangeOfXStringAxis,
  findVSBCNumericMinMaxOfY,
  formatDate,
  formatValueWithSIPrefix,
  getAccessibleDataObject,
  getBarWidth,
  getNextGradient,
  getScalePadding,
  getTypeOfAxis,
  IAxisData,
  IDomainNRange,
  isScalePaddingDefined,
  tooltipOfXAxislabels,
  XAxisTypes,
} from '../../utilities/index';
import { ILegend, Legends } from '../Legends/index';

const getClassNames = classNamesFunction<IVerticalStackedBarChartStyleProps, IVerticalStackedBarChartStyles>();
type NumericAxis = D3Axis<number | { valueOf(): number }>;
type NumericScale = D3ScaleLinear<number, number>;
const COMPONENT_NAME = 'VERTICAL STACKED BAR CHART';

// When displaying gaps between bars, the max height of the gap is given in the
// props. The actual gap is calculated with this multiplier, with a minimum gap
// of 1 pixel. (If these values are changed, update the comment for barGapMax.)
const barGapMultiplier = 0.2;
const barGapMin = 1;

const MIN_DOMAIN_MARGIN = 8;

interface IRefArrayData {
  refElement?: SVGGElement | null;
}

type LinePoint = ILineDataInVerticalStackedBarChart & { index: number; xItem: IVerticalStackedChartProps };
type LineObject = { [key: string]: LinePoint[] };
type LineLegends = {
  title: string;
  color: string;
};
enum CircleVisbility {
  show = 'visibility',
  hide = 'hidden',
}

type CalloutAnchorPointData = {
  xAxisDataPoint: string;
  chartDataPoint: IVSChartDataPoint;
};

export interface IVerticalStackedBarChartState extends IBasestate {
  dataPointCalloutProps?: IVSChartDataPoint;
  stackCalloutProps?: IVerticalStackedChartProps;
  activeXAxisDataPoint: number | string | Date;
  callOutAccessibilityData?: IAccessibilityProps;
  calloutLegend: string;
  selectedLegends: string[];
}
export class VerticalStackedBarChartBase
  extends React.Component<IVerticalStackedBarChartProps, IVerticalStackedBarChartState>
  implements IChart
{
  public static defaultProps: Partial<IVerticalStackedBarChartProps> = {
    maxBarWidth: 24,
    useUTC: true,
  };

  private _points: IVerticalStackedChartProps[];
  private _dataset: IVerticalStackedBarDataPoint[];
  private _xAxisLabels: string[];
  private _bars: JSX.Element[];
  private _xAxisType: XAxisTypes;
  private _barWidth: number;
  private _calloutId: string;
  private _colors: string[];
  private margins: IMargins;
  private _isRtl: boolean = getRTL();
  private _createLegendsForLine: (data: IVerticalStackedChartProps[]) => LineLegends[];
  private _lineObject: LineObject;
  private _tooltipId: string;
  private _yMax: number;
  private _calloutAnchorPoint: CalloutAnchorPointData | null;
  private _domainMargin: number;
  private _classNames: IProcessedStyleSet<IVerticalStackedBarChartStyles>;
  private _emptyChartId: string;
  private _xAxisInnerPadding: number;
  private _xAxisOuterPadding: number;
  private _cartesianChartRef: React.RefObject<IChart>;

  const VerticalStackedBarChartBase: React.FC<IVerticalStackedBarChartProps> = (props) => {
    const [isCalloutVisible, setIsCalloutVisible] = React.useState(false);
    const [selectedLegends, setSelectedLegends] = React.useState(props.legendProps?.selectedLegends || []);
    const [activeLegend, setActiveLegend] = React.useState<string | undefined>(undefined);
    const [refSelected, setRefSelected] = React.useState<null | SVGGElement>(null);
    const [dataForHoverCard, setDataForHoverCard] = React.useState(0);
    const [color, setColor] = React.useState('');
    const [hoverXValue, setHoverXValue] = React.useState('');
    const [YValueHover, setYValueHover] = React.useState<[]>([]);
    const [xCalloutValue, setXCalloutValue] = React.useState('');
    const [yCalloutValue, setYCalloutValue] = React.useState('');
    const [activeXAxisDataPoint, setActiveXAxisDataPoint] = React.useState('');
    const [calloutLegend, setCalloutLegend] = React.useState('');

    React.useEffect(() => {
      warnDeprecations(COMPONENT_NAME, props, {
        colors: 'IVSChartDataPoint.color',
        chartLabel: 'use your own title for chart',
      });
      _calloutId = getId('callout');
      _tooltipId = getId('VSBCTooltipId_');
      if (!_isChartEmpty()) {
        _adjustProps();
        _dataset = _createDataSetLayer();
      }
      _createLegendsForLine = memoizeFunction((data: IVerticalStackedChartProps[]) => _getLineLegends(data));
      _emptyChartId = getId('_VSBC_empty');
      _domainMargin = MIN_DOMAIN_MARGIN;
      _cartesianChartRef = React.createRef();
    }, []);

    // Rest of the component logic...
  };

  export default VerticalStackedBarChartBase;

  React.useEffect(() => {
    if (!areArraysEqual(prevLegendProps?.selectedLegends, props.legendProps?.selectedLegends)) {
      setSelectedLegends(props.legendProps?.selectedLegends || []);
    }
  }, [props.legendProps?.selectedLegends, prevLegendProps?.selectedLegends]);

  React.useEffect(() => {
    if (
      prevProps.height !== props.height ||
      prevProps.width !== props.width ||
      prevProps.data !== props.data
    ) {
      adjustProps();
      setDataset(createDataSetLayer());
    }
  }, [props.height, props.width, props.data, prevProps.height, prevProps.width, prevProps.data]);

  const renderChart = () => {
    if (!_isChartEmpty()) {
      _adjustProps();
      const _isHavingLines = props.data.some(
        (item: IVerticalStackedChartProps) => item.lineData && item.lineData.length > 0,
      );
      const shouldFocusWholeStack = _toFocusWholeStack(_isHavingLines);
      const { isCalloutForStack = false } = props;
      _dataset.current = _createDataSetLayer();
      const legendBars: JSX.Element = _getLegendData(
        _points.current,
        props.theme!.palette,
        _createLegendsForLine(props.data),
      );
      _classNames.current = getClassNames(props.styles!, {
        theme: props.theme!,
        href: props.href!,
      });
      const calloutProps: IModifiedCartesianChartProps['calloutProps'] = {
        isCalloutVisible,
        directionalHint: DirectionalHint.topAutoEdge,
        id: `toolTip${_calloutId.current}`,
        target: refSelected,
        isBeakVisible: false,
        gapSpace: 15,
        color,
        legend: calloutLegend,
        XValue: xCalloutValue!,
        YValue: yCalloutValue ? yCalloutValue : dataForHoverCard,
        YValueHover,
        hoverXValue,
        onDismiss: _closeCallout,
        preventDismissOnLostFocus: true,
        ...props.calloutProps,
        ...getAccessibleDataObject(callOutAccessibilityData),
      };
      const tickParams = {
        tickValues: props.tickValues,
        tickFormat: props.tickFormat,
      };

      return (
        <CartesianChart
          {...props}
          chartTitle={_getChartTitle()}
          points={_dataset.current}
          chartType={ChartTypes.VerticalStackedBarChart}
          xAxisType={_xAxisType.current}
          calloutProps={calloutProps}
          createYAxis={createNumericYAxis}
          tickParams={tickParams}
          legendBars={legendBars}
          getMinMaxOfYAxis={findVSBCNumericMinMaxOfY}
          datasetForXAxisDomain={_xAxisLabels.current}
          isCalloutForStack={shouldFocusWholeStack}
          getDomainNRangeValues={_getDomainNRangeValues}
          createStringYAxis={createStringYAxis}
          barwidth={_barWidth.current}
          focusZoneDirection={
            isCalloutForStack || _isHavingLines ? FocusZoneDirection.horizontal : FocusZoneDirection.vertical
          }
          getmargins={_getMargins}
          getGraphData={_getGraphData}
          getAxisData={_getAxisData}
          customizedCallout={_getCustomizedCallout()}
          onChartMouseLeave={_handleChartMouseLeave}
          getDomainMargins={_getDomainMargins}
          {...(_xAxisType.current === XAxisTypes.StringAxis && {
            xAxisInnerPadding: _xAxisInnerPadding.current,
            xAxisOuterPadding: _xAxisOuterPadding.current,
          })}
          ref={_cartesianChartRef}
          /* eslint-disable react/jsx-no-bind */
          children={(props: IChildProps) => {
            return (
              <>
                <g>{_bars.current}</g>
                <g>
                  {_isHavingLines &&
                    _createLines(
                      props.xScale!,
                      props.yScale!,
                      props.containerHeight!,
                      props.containerWidth!,
                      props.yScaleSecondary,
                    )}
                </g>
              </>
            );
          }}
        />
      );
    }
    return (
      <div
        id={_emptyChartId.current}
        role={'alert'}
        style={{ opacity: '0' }}
        aria-label={'Graph has no data to display'}
      />
    );
  };

  return renderChart();
};

  const chartContainer = React.useCallback((): HTMLElement | null => {
    return _cartesianChartRef.current?.chartContainer || null;
  }, []);

  /**
   * This function tells us what to focus either the whole stack as focusable item.
   * or each individual item in the stack as focusable item. basically it depends
   * on the prop `isCalloutForStack` if it's false user can focus each individual bar
   * within the bar if it's true then user can focus whole bar as item.
   * but if we have lines in the chart then we force the user to focus only the whole
   * bar, even if isCalloutForStack is false
   */
  const toFocusWholeStack = (_isHavingLines: boolean): boolean => {
    const { isCalloutForStack = false } = props;
    let shouldFocusStackOnly: boolean = false;
    if (_isHavingLines) {
      if (getHighlightedLegend().length === 1) {
        shouldFocusStackOnly = false;
      } else {
        shouldFocusStackOnly = true;
      }
    } else {
      shouldFocusStackOnly = isCalloutForStack;
    }
    return shouldFocusStackOnly;
  };

  const getDomainNRangeValues = (
    points: IDataPoint[],
    margins: IMargins,
    width: number,
    chartType: ChartTypes,
    isRTL: boolean,
    xAxisType: XAxisTypes,
    barWidth: number,
    tickValues: Date[] | number[] | undefined,
    shiftX: number,
  ) => {
    let domainNRangeValue: IDomainNRange;
    if (xAxisType === XAxisTypes.NumericAxis) {
      domainNRangeValue = domainRangeOfVSBCNumeric(points, margins, width, isRTL, barWidth!);
    } else if (xAxisType === XAxisTypes.DateAxis) {
      domainNRangeValue = domainRangeOfDateForAreaLineVerticalBarChart(
        points,
        margins,
        width,
        isRTL,
        tickValues! as Date[],
        chartType,
        barWidth,
      );
    } else {
      domainNRangeValue = domainRangeOfXStringAxis(margins, width, isRTL);
    }
    return domainNRangeValue;
  };

  const getFormattedLineData = (data: IVerticalStackedChartProps[]): LineObject => {
    const linesData: LinePoint[] = [];
    const formattedLineData: LineObject = {};
    data.forEach((item: IVerticalStackedChartProps, index: number) => {
      if (item.lineData) {
        // injecting corresponding x data point in each of the line data
        // we inject index also , it will be helpful to draw lines when x axis is
        // of string type
        item.lineData.forEach(line => {
          linesData.push({
            ...line,
            index,
            xItem: item,
          });
        });
      }
    });
    linesData.forEach(item => {
      if (formattedLineData[item.legend]) {
        formattedLineData[item.legend].push(item);
      } else {
        formattedLineData[item.legend] = [item];
      }
    });
    return formattedLineData;
  };

  const getLineLegends = (data: IVerticalStackedChartProps[]): LineLegends[] => {
    const lineObject: LineObject = lineObjectRef.current;
    const lineLegends: LineLegends[] = [];
    Object.keys(lineObject).forEach((item: string) => {
      lineLegends.push({
        title: item,
        color: lineObject[item][0].color,
      });
    });
    return lineLegends;
  };

  const createLines = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xScale: any,
    yScale: NumericScale,
    containerHeight: number,
    containerWidth: number,
    secondaryYScale?: NumericScale,
  ): JSX.Element => {
    const lineObject: LineObject = getFormattedLineData(props.data);
    const lines: React.ReactNode[] = [];
    const borderForLines: React.ReactNode[] = [];
    const dots: React.ReactNode[] = [];
    const { theme } = props;
    const lineBorderWidth = props.lineOptions?.lineBorderWidth
      ? Number.parseFloat(props.lineOptions!.lineBorderWidth!.toString())
      : 0;

    const xScaleBandwidthTranslate = xAxisType !== XAxisTypes.StringAxis ? 0 : xScale.bandwidth() / 2;
    Object.keys(lineObject).forEach((item: string, index: number) => {
      const shouldHighlight = isLegendHighlighted(item) || noLegendHighlighted(); // item is legend name
      for (let i = 1; i < lineObject[item].length; i++) {
        const x1 = xScale(lineObject[item][i - 1].xItem.xAxisPoint);
        const useSecondaryYScale =
          lineObject[item][i - 1].useSecondaryYScale && lineObject[item][i].useSecondaryYScale && secondaryYScale;
        const y1 = useSecondaryYScale ? secondaryYScale!(lineObject[item][i - 1].y) : yScale(lineObject[item][i - 1].y);
        const x2 = xScale(lineObject[item][i].xItem.xAxisPoint);
        const y2 = useSecondaryYScale ? secondaryYScale!(lineObject[item][i].y) : yScale(lineObject[item][i].y);

        if (lineBorderWidth > 0) {
          borderForLines.push(
            <line
              key={`${index}-${i}-BorderLine`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              opacity={shouldHighlight ? 1 : 0.1}
              strokeWidth={3 + lineBorderWidth * 2}
              fill="transparent"
              strokeLinecap="round"
              stroke={theme!.semanticColors.bodyBackground}
              transform={`translate(${xScaleBandwidthTranslate}, 0)`}
            />,
          );
        }
        lines.push(
          <line
            key={`${index}-${i}-line`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            opacity={shouldHighlight ? 1 : 0.1}
            strokeWidth={lineObject[item][0].lineOptions?.strokeWidth ?? 3}
            strokeLinecap={lineObject[item][0].lineOptions?.strokeLinecap ?? 'round'}
            strokeDasharray={lineObject[item][0].lineOptions?.strokeDasharray}
            stroke={lineObject[item][i].color}
            transform={`translate(${xScaleBandwidthTranslate}, 0)`}
            {...(isLegendHighlighted(item) && {
              onMouseOver: lineHover.bind(this, lineObject[item][i - 1]),
              onMouseLeave: lineHoverOut,
            })}
          />,
        );
      }
    });
    Object.keys(lineObject).forEach((item: string, index: number) => {
      lineObject[item].forEach((circlePoint: LinePoint, subIndex: number) => {
        // Create an object to store line point ref so that the object can be passed by reference to the focus handler
        const circleRef: { refElement: SVGCircleElement | null } = { refElement: null };
        dots.push(
          <circle
            key={`${index}-${subIndex}-dot`}
            cx={xScale(circlePoint.xItem.xAxisPoint)}
            cy={
              circlePoint.useSecondaryYScale && secondaryYScale ? secondaryYScale(circlePoint.y) : yScale(circlePoint.y)
            }
            onMouseOver={
              isLegendHighlighted(item)
                ? lineHover.bind(this, circlePoint)
                : onStackHover.bind(this, circlePoint.xItem)
            }
            {...(isLegendHighlighted(item) && {
              onMouseLeave: lineHoverOut,
            })}
            r={getCircleVisibilityAndRadius(circlePoint.xItem.xAxisPoint, circlePoint.legend).radius}
            stroke={circlePoint.color}
            fill={props.theme!.semanticColors.bodyBackground}
            strokeWidth={3}
            visibility={getCircleVisibilityAndRadius(circlePoint.xItem.xAxisPoint, circlePoint.legend).visibility}
            transform={`translate(${xScaleBandwidthTranslate}, 0)`}
            // When no legend is highlighted: Line points are automatically displayed along with the bars
            // at the same x-axis point in the stack callout. So to prevent an increase in focusable elements
            // and avoid conveying duplicate info, make these line points non-focusable.
            data-is-focusable={isLegendHighlighted(item)}
            ref={e => (circleRef.refElement = e)}
            onFocus={lineFocus.bind(this, circlePoint, circleRef)}
            onBlur={lineHoverOut}
          />,
        );
      });
    });
    return (
      <>
        {borderForLines}
        {lines}
        {dots}
      </>
    );
  };

  const getCircleVisibilityAndRadius = (
    xAxisPoint: string | number | Date,
    legend: string,
  ): { visibility: CircleVisbility; radius: number } => {
    if (!noLegendHighlighted()) {
      if (xAxisPoint === activeXAxisDataPoint && isLegendHighlighted(legend)) {
        return { visibility: CircleVisbility.show, radius: 8 };
      } else if (isLegendHighlighted(legend)) {
        return { visibility: CircleVisbility.show, radius: 0.3 };
      } else {
        return { visibility: CircleVisbility.hide, radius: 0 };
      }
    } else {
      return {
        visibility: activeXAxisDataPoint === xAxisPoint ? CircleVisbility.show : CircleVisbility.hide,
        radius: 8,
      };
    }
  };

  const adjustProps = () => {
    _points = props.data || [];
    _barWidth = getBarWidth(props.barWidth, props.maxBarWidth);
    const { theme } = props;
    const { palette } = theme!;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    _colors = props.colors || [palette.blueLight, palette.blue, palette.blueMid, palette.red, palette.black];
    _xAxisType = getTypeOfAxis(props.data[0].xAxisPoint, true) as XAxisTypes;
    _lineObject = getFormattedLineData(props.data);
    _xAxisInnerPadding = getScalePadding(props.xAxisInnerPadding, props.xAxisPadding, 2 / 3);
    _xAxisOuterPadding = getScalePadding(props.xAxisOuterPadding, props.xAxisPadding, 0);
  }

  const createDataSetLayer = (): IVerticalStackedBarDataPoint[] => {
    const tempArr: string[] = [];
    const dataset: IVerticalStackedBarDataPoint[] = points.map(singlePointData => {
      let total: number = 0;
      singlePointData.chartData!.forEach((point: IVSChartDataPoint) => {
        total = total + point.data;
      });
      tempArr.push(singlePointData.xAxisPoint as string);
      return {
        x: singlePointData.xAxisPoint,
        y: total,
      };
    });
    setXAxisLabels(tempArr);
    return dataset;
  };

  const _getMargins = (margins: IMargins) => {
    marginsRef.current = margins;
  };

  const renderCallout = (props?: IVSChartDataPoint): JSX.Element | null => {
    return props ? (
      <ChartHoverCard
        XValue={props.xAxisCalloutData}
        Legend={props.legend}
        YValue={props.yAxisCalloutData}
        color={props.color}
        culture={props.culture}
      />
    ) : null;
  };

  const getCustomizedCallout = () => {
    const _isHavingLines = props.data.some(
      (item: IVerticalStackedChartProps) => item.lineData && item.lineData.length > 0,
    );
    return props.onRenderCalloutPerStack
      ? props.onRenderCalloutPerStack(stackCalloutProps)
      : props.onRenderCalloutPerDataPoint && !_isHavingLines
      ? props.onRenderCalloutPerDataPoint(dataPointCalloutProps, renderCallout)
      : null;
  };

  const _onLegendHover = (legendTitle: string): void => {
    setActiveLegend(legendTitle);
  };

  const [activeLegend, setActiveLegend] = React.useState<string | undefined>(undefined);

  const _onLegendLeave = (): void => {
    setActiveLegend(undefined);
  };



  const getLegendData = (
    data: IVerticalStackedChartProps[],
    palette: IPalette,
    lineLegends: LineLegends[],
  ): JSX.Element => {
    if (props.hideLegend) {
      return <></>;
    }
    const defaultPalette: string[] = [palette.blueLight, palette.blue, palette.blueMid, palette.red, palette.black];
    const actions: ILegend[] = [];
    const { allowHoverOnLegend = true, theme } = props;

    data.forEach((singleChartData: IVerticalStackedChartProps) => {
      singleChartData.chartData.forEach((point: IVSChartDataPoint) => {
        let color: string = point.color ? point.color : defaultPalette[Math.floor(Math.random() * 4 + 1)];
        if (props.enableGradient) {
          const pointIndex = Math.max(
            singleChartData.chartData?.findIndex(item => item.legend === point.legend) || 0,
            0,
          );
          color = point.gradient?.[0] || getNextGradient(pointIndex, 0, theme?.isInverted)[0];
        }

        const checkSimilarLegends = actions.filter((leg: ILegend) => leg.title === point.legend && leg.color === color);
        if (checkSimilarLegends!.length > 0) {
          return;
        }

        const legend: ILegend = {
          title: point.legend,
          color,
          hoverAction: allowHoverOnLegend
            ? () => {
                handleChartMouseLeave();
                onLegendHover(point.legend);
              }
            : undefined,
          onMouseOutAction: allowHoverOnLegend ? () => onLegendLeave() : undefined,
        };

        actions.push(legend);
      });
    });
    const legendsOfLine: ILegend[] = [];
    if (lineLegends && lineLegends.length > 0) {
      lineLegends.forEach((point: LineLegends) => {
        const legend: ILegend = {
          title: point.title,
          color: point.color,
          isLineLegendInBarChart: true,
          hoverAction: allowHoverOnLegend
            ? () => {
                handleChartMouseLeave();
                onLegendHover(point.title);
              }
            : undefined,
          onMouseOutAction: allowHoverOnLegend ? () => onLegendLeave() : undefined,
        };
        legendsOfLine.push(legend);
      });
    }
    const totalLegends: ILegend[] = legendsOfLine.concat(actions);
    return (
      <Legends
        legends={totalLegends}
        overflowProps={props.legendsOverflowProps}
        enabledWrapLines={props.enabledLegendsWrapLines}
        focusZonePropsInHoverCard={props.focusZonePropsForLegendsInHoverCard}
        overflowText={props.legendsOverflowText}
        {...props.legendProps}
        onChange={onLegendSelectionChange}
      />
    );
  }

  const onLegendSelectionChange = (
    selectedLegends: string[],
    event: React.MouseEvent<HTMLButtonElement>,
    currentLegend?: ILegend,
  ): void => {
    if (props.legendProps?.canSelectMultipleLegends) {
      setSelectedLegends(selectedLegends);
    } else {
      setSelectedLegends(selectedLegends.slice(-1));
    }
    if (props.legendProps?.onChange) {
      props.legendProps.onChange(selectedLegends, event, currentLegend);
    }
  }

  const getHighlightedLegend = () => {
    return selectedLegends.length > 0
      ? selectedLegends
      : activeLegend
      ? [activeLegend]
      : [];
  };

  const onRectHover = (
    xAxisPoint: string,
    point: IVSChartDataPoint,
    color: string,
    mouseEvent: React.MouseEvent<SVGElement>,
  ): void => {
    mouseEvent.persist();
    onRectFocusHover(xAxisPoint, point, color, mouseEvent);
  }

  const onRectFocusHover = (
    xAxisPoint: string,
    point: IVSChartDataPoint,
    color: string,
    refSelected: React.MouseEvent<SVGElement> | SVGGElement,
  ) => {
    if (calloutAnchorPoint?.chartDataPoint !== point || calloutAnchorPoint?.xAxisDataPoint !== xAxisPoint) {
      setCalloutAnchorPoint({
        chartDataPoint: point,
        xAxisDataPoint: xAxisPoint,
      });
      setRefSelected(refSelected);
      setIsCalloutVisible(noLegendHighlighted() || isLegendHighlighted(point.legend));
      setCalloutLegend(point.legend);
      setDataForHoverCard(point.data);
      setColor(color);
      setXCalloutValue(point.xAxisCalloutData ? point.xAxisCalloutData : xAxisPoint);
      setYCalloutValue(point.yAxisCalloutData);
      setDataPointCalloutProps(point);
      setCallOutAccessibilityData(point.callOutAccessibilityData);
    }
  };

  const _lineHover = (lineData: LinePoint, mouseEvent: React.MouseEvent<SVGElement>) => {
    mouseEvent.persist();
    _lineHoverFocus(lineData, mouseEvent);
  };

  const _lineHoverOut = () => {
    setRefSelected(null);
    setIsCalloutVisible(false);
    setXCalloutValue('');
    setYCalloutValue('');
    setActiveXAxisDataPoint('');
    setColor('');
  };

  const _lineFocus = (lineData: LinePoint, ref: { refElement: SVGCircleElement | null }) => {
    if (ref.refElement) {
      _lineHoverFocus(lineData, ref.refElement);
    }
  };

  const lineHoverFocus = (lineData: LinePoint, refSelected: React.MouseEvent<SVGElement> | SVGCircleElement) => {
    setRefSelected(refSelected);
    setIsCalloutVisible(true);
    setXCalloutValue(`${lineData.xItem.xAxisPoint}`);
    setYCalloutValue(`${lineData.yAxisCalloutData || lineData.data || lineData.y}`);
    setActiveXAxisDataPoint(lineData.xItem.xAxisPoint);
    setColor(lineData.color);
  };

  const _onStackHover = (stack: IVerticalStackedChartProps, mouseEvent: React.MouseEvent<SVGElement>): void => {
    mouseEvent.persist();
    _onStackHoverFocus(stack, mouseEvent);
  }

  const onStackHoverFocus = (
    stack: IVerticalStackedChartProps,
    refSelected: React.MouseEvent<SVGElement> | SVGGElement,
  ): void => {
    if (!noLegendHighlighted()) {
      stack = {
        ...stack,
        chartData: stack.chartData.filter(dataPoint => isLegendHighlighted(dataPoint.legend)),
        lineData: stack.lineData?.filter(dataPoint => isLegendHighlighted(dataPoint.legend)),
      };
    }
    const lineData = stack.lineData;
    const isLinesPresent: boolean = lineData !== undefined && lineData.length > 0;
    if (isLinesPresent) {
      lineData!.forEach((item: ILineDataInVerticalStackedBarChart & { shouldDrawBorderBottom?: boolean }) => {
        item.data = item.data || item.y;
        item.shouldDrawBorderBottom = true;
      });
    }

    setRefSelected(refSelected);
    setIsCalloutVisible(stack.chartData.length > 0 || (stack.lineData?.length ?? 0) > 0);
    setYValueHover(
      isLinesPresent
        ? [...lineData!.sort((a, b) => (a.data! < b.data! ? 1 : -1)), ...stack.chartData.slice().reverse()]
        : stack.chartData.slice().reverse(),
    );
    setHoverXValue(
      stack.xAxisPoint instanceof Date ? formatDate(stack.xAxisPoint, useUTC) : stack.xAxisPoint,
    );
    setStackCalloutProps(stack);
    setActiveXAxisDataPoint(stack.xAxisPoint);
    setCallOutAccessibilityData(stack.stackCallOutAccessibilityData);
  };

  const onRectFocus = (point: IVSChartDataPoint, xAxisPoint: string, color: string, ref: IRefArrayData): void => {
    if (ref.refElement) {
      onRectFocusHover(xAxisPoint, point, color, ref.refElement);
    }
  }

  const onStackFocus = (stack: IVerticalStackedChartProps, groupRef: IRefArrayData): void => {
    if (groupRef.refElement) {
      onStackHoverFocus(stack, groupRef.refElement);
    }
  }

  const _handleMouseOut = (): void => {
    /**/
  };

  const handleChartMouseLeave = (): void => {
    setCalloutAnchorPoint(null);
    setIsCalloutVisible(false);
    setActiveXAxisDataPoint('');
  };

  const onClick = (
    data: IVerticalStackedChartProps | IVSChartDataPoint,
    mouseEvent: React.MouseEvent<SVGElement>,
  ): void => {
    props.onBarClick?.(mouseEvent, data);
    props.href ? (window.location.href = props.href) : '';
  }

  const getBarGapAndScale = (
    bars: IVSChartDataPoint[],
    yBarScale: NumericScale,
    defaultTotalHeight?: number,
  ): {
    readonly gapHeight: number;
    readonly heightValueScale: number;
  } => {
    const { barGapMax = 0 } = props;

    // When displaying gaps between the bars, the height of each bar is
    // adjusted so that the total of all bars is not changed by the gaps
    const totalData = bars.reduce((iter, value) => iter + value.data, 0);
    const totalHeight = defaultTotalHeight ?? yBarScale(totalData);
    const gaps = barGapMax && bars.length - 1;
    const gapHeight = gaps && Math.max(barGapMin, Math.min(barGapMax, (totalHeight * barGapMultiplier) / gaps));
    const heightValueScale = (totalHeight - gapHeight * gaps) / totalData;

    return {
      gapHeight,
      heightValueScale,
    } as const;
  };

  const createBar = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xBarScale: any,
    yBarScale: NumericScale,
    containerHeight: number,
    xElement: SVGElement,
    props: IVerticalStackedBarChartProps,
    points: IVerticalStackedChartProps[],
    xAxisType: XAxisTypes,
    barWidth: number,
    colors: string[],
    yMax: number,
    margins: IMargins,
    classNames: IProcessedStyleSet<IVerticalStackedBarChartStyles>,
    tooltipId: string,
    getBarGapAndScale: (bars: IVSChartDataPoint[], yBarScale: NumericScale) => { gapHeight: number; heightValueScale: number; },
    isLegendHighlighted: (legendTitle: string) => boolean,
    noLegendHighlighted: () => boolean,
    getAriaLabel: (singleChartData: IVerticalStackedChartProps, point?: IVSChartDataPoint) => string,
    onRectHover: (xAxisPoint: string, point: IVSChartDataPoint, color: string, mouseEvent: React.MouseEvent<SVGElement>) => void,
    onRectFocus: (point: IVSChartDataPoint, xAxisPoint: string, color: string, ref: IRefArrayData) => void,
    onClick: (data: IVerticalStackedChartProps | IVSChartDataPoint, mouseEvent: React.MouseEvent<SVGElement>) => void,
    handleMouseOut: () => void,
    onStackHover: (stack: IVerticalStackedChartProps, mouseEvent: React.MouseEvent<SVGElement>) => void,
    onStackFocus: (stack: IVerticalStackedChartProps, groupRef: IRefArrayData) => void,
  ): JSX.Element[] => {
    const { barCornerRadius = 0, barMinimumHeight = 0 } = props;
    const _isHavingLines = props.data.some(
      (item: IVerticalStackedChartProps) => item.lineData && item.lineData.length > 0,
    );
    const shouldFocusWholeStack = toFocusWholeStack(_isHavingLines, props, isLegendHighlighted, noLegendHighlighted);

    if (xAxisType === XAxisTypes.StringAxis) {
      // Setting the bar width here is safe because there are no dependencies earlier in the code
      // that rely on the width of bars in vertical bar charts with string x-axis.
      barWidth = getBarWidth(props.barWidth, props.maxBarWidth, xBarScale.bandwidth());
    }

    const bars = points.map((singleChartData: IVerticalStackedChartProps, indexNumber: number) => {
      let yPoint = containerHeight - margins.bottom!;
      const xPoint = xBarScale(
        xAxisType === XAxisTypes.NumericAxis
          ? (singleChartData.xAxisPoint as number)
          : xAxisType === XAxisTypes.DateAxis
          ? (singleChartData.xAxisPoint as Date)
          : (singleChartData.xAxisPoint as string),
      );
      const xScaleBandwidthTranslate =
        xAxisType !== XAxisTypes.StringAxis ? -barWidth / 2 : (xBarScale.bandwidth() - barWidth) / 2;

      let barTotalValue = 0;

      // Removing datapoints with zero data
      const barsToDisplay = singleChartData.chartData.filter(point => point.data > 0);

      if (!barsToDisplay.length) {
        return undefined;
      }

      const { gapHeight, heightValueScale } = getBarGapAndScale(barsToDisplay, yBarScale);

      if (heightValueScale < 0) {
        return undefined;
      }

      const singleBar = barsToDisplay.map((point: IVSChartDataPoint, index: number) => {
        let startColor = point.color ? point.color : colors[index];
        let endColor = startColor;

        if (props.enableGradient) {
          startColor = point.gradient?.[0] || getNextGradient(index, 0, props.theme?.isInverted)[0];
          endColor = point.gradient?.[1] || getNextGradient(index, 0, props.theme?.isInverted)[1];
          singleChartData.chartData[index].color = startColor;
        }

        const ref: IRefArrayData = {};

        const shouldHighlight = isLegendHighlighted(point.legend) || noLegendHighlighted() ? true : false;
        classNames = getClassNames(props.styles!, {
          theme: props.theme!,
          shouldHighlight,
          href: props.href,
        });
        const rectFocusProps = !shouldFocusWholeStack && {
          'data-is-focusable': !props.hideTooltip && shouldHighlight,
          'aria-label': getAriaLabel(singleChartData, point),
          onMouseOver: (e: React.MouseEvent<SVGElement>) => onRectHover(singleChartData.xAxisPoint, point, startColor, e),
          onMouseMove: (e: React.MouseEvent<SVGElement>) => onRectHover(singleChartData.xAxisPoint, point, startColor, e),
          onMouseLeave: handleMouseOut,
          onFocus: () => onRectFocus(point, singleChartData.xAxisPoint, startColor, ref),
          onBlur: handleMouseOut,
          onClick: (e: React.MouseEvent<SVGElement>) => onClick(point, e),
          role: 'img',
        };

        let barHeight = heightValueScale * point.data;
        if (barHeight < Math.max(Math.ceil((heightValueScale * yMax) / 100.0), barMinimumHeight)) {
          barHeight = Math.max(Math.ceil((heightValueScale * yMax) / 100.0), barMinimumHeight);
        }
        yPoint = yPoint - barHeight - (index ? gapHeight : 0);
        barTotalValue += point.data;

        const gradientId = getId('VSBC_Gradient') + `_${indexNumber}_${index}`;

        // If set, apply the corner radius to the top of the final bar
        if (barCornerRadius && barHeight > barCornerRadius && index === barsToDisplay.length - 1) {
          return (
            <React.Fragment key={index + indexNumber + `${shouldFocusWholeStack}`}>
              {props.enableGradient && (
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0" stopColor={startColor} />
                    <stop offset="100%" stopColor={endColor} />
                  </linearGradient>
                </defs>
              )}
              <path
                className={classNames.opacityChangeOnHover}
                d={`
                  M ${xPoint} ${yPoint + barCornerRadius}
                  a ${barCornerRadius} ${barCornerRadius} 0 0 1 ${barCornerRadius} ${-barCornerRadius}
                  h ${barWidth - 2 * barCornerRadius}
                  a ${barCornerRadius} ${barCornerRadius} 0 0 1 ${barCornerRadius} ${barCornerRadius}
                  v ${barHeight - barCornerRadius}
                  h ${-barWidth}
                  z
                `}
                fill={props.enableGradient ? `url(#${gradientId})` : startColor}
                rx={props.roundCorners ? 3 : 0}
                ref={e => (ref.refElement = e)}
                transform={`translate(${xScaleBandwidthTranslate}, 0)`}
                {...rectFocusProps}
              />
            </React.Fragment>
          );
        }
        if (barHeight < 0) {
          return <React.Fragment key={index + indexNumber}> </React.Fragment>;
        }
        return (
          <React.Fragment key={index + indexNumber}>
            {props.enableGradient && (
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0" stopColor={startColor} />
                  <stop offset="100%" stopColor={endColor} />
                </linearGradient>
              </defs>
            )}
            <rect
              className={classNames.opacityChangeOnHover}
              x={xPoint}
              y={yPoint}
              width={barWidth}
              height={barHeight}
              fill={props.enableGradient ? `url(#${gradientId})` : startColor}
              rx={props.roundCorners ? 3 : 0}
              ref={e => (ref.refElement = e)}
              {...rectFocusProps}
              transform={`translate(${xScaleBandwidthTranslate}, 0)`}
            />
          </React.Fragment>
        );
      });
      const groupRef: IRefArrayData = {};
      const stackFocusProps = shouldFocusWholeStack && {
        'data-is-focusable': !props.hideTooltip,
        'aria-label': getAriaLabel(singleChartData),
        onMouseOver: (e: React.MouseEvent<SVGElement>) => onStackHover(singleChartData, e),
        onMouseMove: (e: React.MouseEvent<SVGElement>) => onStackHover(singleChartData, e),
        onMouseLeave: handleMouseOut,
        onFocus: () => onStackFocus(singleChartData, groupRef),
        onBlur: handleMouseOut,
        onClick: (e: React.MouseEvent<SVGElement>) => onClick(singleChartData, e),
        role: 'img',
      };
      let showLabel = false;
      let barLabel = 0;
      if (!props.hideLabels) {
        if (noLegendHighlighted()) {
          showLabel = true;
          barLabel = barTotalValue;
        } else {
          barsToDisplay.forEach(point => {
            if (isLegendHighlighted(point.legend)) {
              showLabel = true;
              barLabel += point.data;
            }
          });
        }
      }
      return (
        <g key={indexNumber + `${shouldFocusWholeStack}`}>
          <g id={`${indexNumber}-singleBar`} ref={e => (groupRef.refElement = e)} {...stackFocusProps}>
            {singleBar}
          </g>
          {!props.hideLabels && barWidth >= 16 && showLabel && (
            <text
              x={xPoint + barWidth / 2}
              y={yPoint - 6}
              textAnchor="middle"
              className={classNames.barLabel}
              aria-label={`Total: ${barLabel}`}
              role="img"
              transform={`translate(${xScaleBandwidthTranslate}, 0)`}
            >
              {formatValueWithSIPrefix(barLabel)}
            </text>
          )}
        </g>
      );
    });
    // Removing un wanted tooltip div from DOM, when prop not provided.
    if (!props.showXAxisLablesTooltip) {
      try {
        document.getElementById(tooltipId) && document.getElementById(tooltipId)!.remove();
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }
    // Used to display tooltip at x axis labels.
    if (!props.wrapXAxisLables && props.showXAxisLablesTooltip) {
      const xAxisElement = d3Select(xElement).call(xBarScale);
      try {
        document.getElementById(tooltipId) && document.getElementById(tooltipId)!.remove();
        // eslint-disable-next-line no-empty
      } catch (e) {}
      const tooltipProps = {
        tooltipCls: classNames.tooltip!,
        id: tooltipId,
        xAxis: xAxisElement,
      };
      xAxisElement && tooltipOfXAxislabels(tooltipProps);
    }
    return bars.filter((bar): bar is JSX.Element => !!bar);
  };

  const getScales = (containerHeight: number, containerWidth: number) => {
    const yMax = yMaxRef.current;
    const yBarScale = d3ScaleLinear()
      .domain([0, yMax])
      .range([0, containerHeight - margins.bottom! - margins.top!]);
    if (xAxisTypeRef.current === XAxisTypes.NumericAxis) {
      const xMax = d3Max(datasetRef.current, (point: IVerticalStackedBarDataPoint) => point.x as number)!;
      const xMin = d3Min(datasetRef.current, (point: IVerticalStackedBarDataPoint) => point.x as number)!;

      const xBarScale = d3ScaleLinear()
        .domain(isRtlRef.current ? [xMax, xMin] : [xMin, xMax])
        .nice()
        .range([margins.left! + domainMarginRef.current, containerWidth - margins.right! - domainMarginRef.current]);

      return { xBarScale, yBarScale };
    }
    if (xAxisTypeRef.current === XAxisTypes.DateAxis) {
      const sDate = d3Min(datasetRef.current, (point: IVerticalStackedBarDataPoint) => {
        return point.x as Date;
      })!;
      const lDate = d3Max(datasetRef.current, (point: IVerticalStackedBarDataPoint) => {
        return point.x as Date;
      })!;
      const xBarScale = props.useUTC ? d3ScaleUtc() : d3ScaleTime();
      xBarScale
        .domain(isRtlRef.current ? [lDate, sDate] : [sDate, lDate])
        .range([margins.left! + domainMarginRef.current, containerWidth - margins.right! - domainMarginRef.current]);

      return { xBarScale, yBarScale };
    }
    const xBarScale = d3ScaleBand()
      .domain(xAxisLabelsRef.current)
      .range(
        isRtlRef.current
          ? [containerWidth - margins.right! - domainMarginRef.current, margins.left! + domainMarginRef.current]
          : [margins.left! + domainMarginRef.current, containerWidth - margins.right! - domainMarginRef.current],
      )
      .paddingInner(xAxisInnerPaddingRef.current)
      .paddingOuter(xAxisOuterPaddingRef.current);

    return { xBarScale, yBarScale };
  };

  const getGraphData = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xScale: any,
    yScale: NumericAxis,
    containerHeight: number,
    containerWidth: number,
    xElement: SVGElement | null,
  ) => {
    const { xBarScale, yBarScale } = getScales(containerHeight, containerWidth);
    return (bars = createBar(xBarScale, yBarScale, containerHeight, xElement!));
  };

  const closeCallout = () => {
    setIsCalloutVisible(false);
  };

  const _getAxisData = (yAxisData: IAxisData) => {
    if (yAxisData && yAxisData.yAxisDomainValues.length) {
      const { yAxisDomainValues: domainValue } = yAxisData;
      _yMax = Math.max(domainValue[domainValue.length - 1], props.yMaxValue || 0);
    }
  };

  /**
   * This function checks if the given legend is highlighted or not.
   * A legend can be highlighted in 2 ways:
   * 1. selection: if the user clicks on it
   * 2. hovering: if there is no selected legend and the user hovers over it
   */
  const isLegendHighlighted = (legendTitle: string): boolean => {
    return getHighlightedLegend().includes(legendTitle);
  };

  /**
   * This function checks if none of the legends is selected or hovered.
   */
  const _noLegendHighlighted = () => {
    return _getHighlightedLegend().length === 0;
  };

  const getAriaLabel = (singleChartData: IVerticalStackedChartProps, point?: IVSChartDataPoint): string => {
    if (!point) {
      /** if shouldFocusWholeStack is true */
      const xValue =
        singleChartData.xAxisCalloutData ||
        (singleChartData.xAxisPoint instanceof Date
          ? formatDate(singleChartData.xAxisPoint)
          : singleChartData.xAxisPoint);
      const pointValues = singleChartData.chartData
        .map(pt => {
          const legend = pt.legend;
          const yValue = pt.yAxisCalloutData || pt.data;
          return `${legend}, ${yValue}.`;
        })
        .join(' ');
      const lineValues = singleChartData.lineData
        ?.map(ln => {
          const legend = ln.legend;
          const yValue = ln.yAxisCalloutData || ln.data || ln.y;
          return `${legend}, ${yValue}.`;
        })
        .join(' ');
      return (
        singleChartData.stackCallOutAccessibilityData?.ariaLabel ||
        `${xValue}. ${pointValues}` + (lineValues ? ` ${lineValues}` : '')
      );
    }
    /** if shouldFocusWholeStack is false */
    const xValue =
      singleChartData.xAxisCalloutData ||
      point.xAxisCalloutData ||
      (singleChartData.xAxisPoint instanceof Date
        ? formatDate(singleChartData.xAxisPoint)
        : singleChartData.xAxisPoint);
    const legend = point.legend;
    const yValue = point.yAxisCalloutData || point.data;
    return point.callOutAccessibilityData?.ariaLabel || `${xValue}. ${legend}, ${yValue}.`;
  };

  const getDomainMargins = (containerWidth: number): IMargins => {
    let domainMargin = MIN_DOMAIN_MARGIN;

    /** Total width available to render the bars */
    const totalWidth =
      containerWidth - (margins.left! + MIN_DOMAIN_MARGIN) - (margins.right! + MIN_DOMAIN_MARGIN);
    /** Rate at which the space between the bars changes wrt the bar width */
    const barGapRate = xAxisInnerPadding / (1 - xAxisInnerPadding);

    if (xAxisType === XAxisTypes.StringAxis) {
      if (isScalePaddingDefined(props.xAxisOuterPadding, props.xAxisPadding)) {
        // Setting the domain margin for string x-axis to 0 because the xAxisOuterPadding prop is now available
        // to adjust the space before the first bar and after the last bar.
        domainMargin = 0;
      } else if (props.barWidth !== 'auto') {
        // Update the bar width so that when CartesianChart rerenders,
        // the following calculations don't use the previous bar width.
        barWidth = getBarWidth(props.barWidth, props.maxBarWidth);
        /** Total width required to render the bars. Directly proportional to bar width */
        const reqWidth = (xAxisLabels.length + (xAxisLabels.length - 1) * barGapRate) * barWidth;

        if (totalWidth >= reqWidth) {
          // Center align the chart by setting equal left and right margins for domain
          domainMargin = MIN_DOMAIN_MARGIN + (totalWidth - reqWidth) / 2;
        }
      } else if (props.mode === 'plotly' && xAxisLabels.length > 1) {
        // Calculate the remaining width after rendering bars at their maximum allowable width
        const bandwidth = totalWidth / (xAxisLabels.length + (xAxisLabels.length - 1) * barGapRate);
        const barWidth = getBarWidth(props.barWidth, props.maxBarWidth, bandwidth);
        let reqWidth = (xAxisLabels.length + (xAxisLabels.length - 1) * barGapRate) * barWidth;
        const margin1 = (totalWidth - reqWidth) / 2;

        // Calculate the remaining width after accounting for the space required to render x-axis labels
        const step = calculateLongestLabelWidth(xAxisLabels) + 20;
        reqWidth = (xAxisLabels.length - xAxisInnerPadding) * step;
        const margin2 = (totalWidth - reqWidth) / 2;

        domainMargin = MIN_DOMAIN_MARGIN + Math.max(0, Math.min(margin1, margin2));
      }
    } else {
      const data = (props.data?.map(point => point.xAxisPoint) as number[] | Date[] | undefined) || [];
      barWidth = getBarWidth(
        props.barWidth,
        props.maxBarWidth,
        calculateAppropriateBarWidth(data, totalWidth),
      );
      domainMargin = MIN_DOMAIN_MARGIN + barWidth / 2;
    }

    return {
      ...margins,
      left: margins.left! + domainMargin,
      right: margins.right! + domainMargin,
    };
  };

  const isChartEmpty = (): boolean => {
    return !(
      props.data &&
      props.data.length > 0 &&
      props.data.some(item => item.chartData.length > 0 || (item.lineData && item.lineData.length > 0))
    );
  };

  const getChartTitle = (): string => {
    const { chartTitle, data } = props;
    const numLines = Object.keys(lineObject).length;
    return (
      (chartTitle ? `${chartTitle}. ` : '') +
      `Vertical bar chart with ${data?.length || 0} stacked bars` +
      (numLines > 0 ? ` and ${numLines} lines` : '') +
      '. '
    );
  };
}
