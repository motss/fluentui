/* eslint-disable one-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
import * as React from 'react';
import { bin as d3Bin, extent as d3Extent, sum as d3Sum, min as d3Min, max as d3Max, merge as d3Merge } from 'd3-array';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { format as d3Format, precisionFixed as d3PrecisionFixed } from 'd3-format';
import { IDonutChartProps } from '../DonutChart/index';
import {
  IChartDataPoint,
  IChartProps,
  IHorizontalBarChartWithAxisDataPoint,
  ILineChartPoints,
  IVerticalStackedChartProps,
  IHeatMapChartData,
  IHeatMapChartDataPoint,
  IGroupedVerticalBarChartData,
  IVerticalBarChartDataPoint,
} from '../../types/IDataPoint';
import { ISankeyChartProps } from '../SankeyChart/index';
import { IVerticalStackedBarChartProps } from '../VerticalStackedBarChart/index';
import { IHorizontalBarChartWithAxisProps } from '../HorizontalBarChartWithAxis/index';
import { ILineChartProps } from '../LineChart/index';
import { IAreaChartProps } from '../AreaChart/index';
import { IHeatMapChartProps } from '../HeatMapChart/index';
import { DataVizPalette, getNextColor } from '../../utilities/colors';
import { GaugeChartVariant, IGaugeChartProps, IGaugeChartSegment } from '../GaugeChart/index';
import { IGroupedVerticalBarChartProps } from '../GroupedVerticalBarChart/index';
import { IVerticalBarChartProps } from '../VerticalBarChart/index';
import { Layout, PlotlySchema, PieData, PlotData, SankeyData } from './PlotlySchema';
import type { Datum,  TypedArray } from './PlotlySchema';

const isDate = (value: any): boolean => !isNaN(Date.parse(value));
const isNumber = (value: any): boolean => !isNaN(parseFloat(value)) && isFinite(value);

// const isDate = (datum: any): datum is Date => {
//   return datum instanceof Date;
// };

const isMonth = (possiblyMonthValue: any, presentYear: number): boolean => {
  return isDate(`${possiblyMonthValue} 01, ${presentYear}`);
};

export const isDateArray = (data: Datum[] | Datum[][] | TypedArray): boolean => {
  if (!isArrayOrTypedArray(data)) {
      return false;
  }

  if (Array.isArray(data[0])) {
      // Handle 2D array
      return (data as Datum[][]).every(innerArray => innerArray.every(isDate));
  } else {
      // Handle 1D array
      return (data as Datum[]).every(isDate);
  }
};

export const isNumberArray = (data: Datum[] | Datum[][] | TypedArray): boolean => {
  if (!isArrayOrTypedArray(data)) {
      return false;
  }

  if (Array.isArray(data[0])) {
      // Handle 2D array
      return (data as Datum[][]).every(innerArray => innerArray.every(isNumber));
  } else {
      // Handle 1D array
      return (data as Datum[]).every(isNumber);
  }
};

export const isMonthArray = (data: Datum[] | Datum[][] | TypedArray): boolean => {
  if (!isArrayOrTypedArray(data)) {
    return false;
}
  if (data.length > 0) {
    const presentYear = new Date().getFullYear();
    if (Array.isArray(data[0])) {
      // Handle 2D array
      return (data as Datum[][]).every(innerArray => innerArray.every(possiblyMonthValue => isMonth(possiblyMonthValue, presentYear)));
    } else {
        // Handle 1D array
        return (data as Datum[]).every(possiblyMonthValue => isMonth(possiblyMonthValue, presentYear));
    }
  }
  return false;
};

function getTitles(layout: Partial<Layout> | undefined) {
  const titles = {
    chartTitle:
      typeof layout?.title === 'string' ? layout.title : layout?.title?.text?? '',
    xAxisTitle:
      typeof layout?.xaxis?.title === 'string'
        ? layout?.xaxis?.title
        : layout?.xaxis?.title?.text?? '',
    yAxisTitle:
      typeof layout?.yaxis?.title === 'string'
        ? layout?.yaxis?.title
        : layout?.yaxis?.title?.text?? '',
  };
  return titles;
}

export const updateXValues = (xValues: Datum[] | Datum[][] | TypedArray): any[] => {
  const presentYear = new Date().getFullYear();
  const dates = xValues.map(possiblyMonthValue => {
    const parsedDate = `${possiblyMonthValue} 01, ${presentYear}`;
    return isDate(parsedDate) ? new Date(parsedDate) : null;
  });
  for (let i = dates.length - 1; i > 0; i--) {
    const currentMonth = dates[i]!.getMonth();
    const previousMonth = dates[i - 1]!.getMonth();
    const currentYear = dates[i]!.getFullYear();
    const previousYear = dates[i - 1]!.getFullYear();
    if (previousMonth >= currentMonth) {
      dates[i - 1]!.setFullYear(dates[i]!.getFullYear() - 1);
    } else if (previousYear > currentYear) {
      dates[i - 1]!.setFullYear(currentYear);
    }
  }
  xValues = xValues.map((month, index) => {
    return `${month} 01, ${dates[index]!.getFullYear()}`;
  });
  return xValues;
};
export const getColor = (
  legendLabel: string,
  colorMap: React.MutableRefObject<Map<string, string>>,
  isDarkTheme?: boolean,
): string => {
  if (!colorMap.current.has(legendLabel)) {
    const nextColor = getNextColor(colorMap.current.size + 1, 0, isDarkTheme);
    colorMap.current.set(legendLabel, nextColor);
    return nextColor;
  }

  return colorMap.current.get(legendLabel) as string;
};

export const transformPlotlyJsonToDonutProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  isDarkTheme?: boolean,
): IDonutChartProps => {
  const firstData = input.data[0] as PieData;

  const donutData = firstData.labels?.map((label: string, index: number): IChartDataPoint => {
    const color = getColor(label, colorMap, isDarkTheme);
    return {
      legend: label,
      data: firstData.values?.[index] as number, //ToDo how to handle string data?
      color,
    };
  });

  const width: number = input.layout?.width?? 440;
  const height: number = input.layout?.height?? 220;
  const hideLabels: boolean = firstData.textinfo
    ? !['value', 'percent', 'label+percent'].includes(firstData.textinfo)
    : false;
  const donutMarginHorizontal: number = hideLabels ? 0 : 80;
  const donutMarginVertical: number = 40 + (hideLabels ? 0 : 40);
  const innerRadius: number = firstData.hole
    ? firstData.hole * (Math.min(width - donutMarginHorizontal, height - donutMarginVertical) / 2)
    : 0;

  const styles: IDonutChartProps['styles'] = {
    root: {
      '[class^="arcLabel"]': {
        ...(typeof firstData.textfont?.size === 'number' ? { fontSize: firstData.textfont.size } : {}),
      },
    },
  };

  const { chartTitle } = getTitles(input.layout);

  return {
    data: {
      chartTitle,
      chartData: donutData,
    },
    hideLegend: input.layout?.showlegend === false ? true : false,
    width,
    height,
    innerRadius,
    hideLabels,
    showLabelsInPercent: firstData.textinfo ? firstData.textinfo === 'percent' : true,
    styles,
  };
};

export const transformPlotlyJsonToVSBCProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  isDarkTheme?: boolean,
): IVerticalStackedBarChartProps => {
  const mapXToDataPoints: { [key: string]: IVerticalStackedChartProps } = {};
  let yMaxValue = 0;

  input.data.forEach((series: PlotData, index1: number) => {
    series.x?.forEach((x: string | number, index2: number) => {
      if (!mapXToDataPoints[x]) {
        mapXToDataPoints[x] = { xAxisPoint: x, chartData: [], lineData: [] };
      }
      const legend: string = series.name || `Series ${index1 + 1}`;
      if (series.type === 'bar' || series.type === 'scatter') {
        const color = getColor(legend, colorMap, isDarkTheme);
        mapXToDataPoints[x].chartData.push({
          legend,
          data: series.y?.[index2],
          color,
        });
      } else if (series.type === 'line') {
        const color = getColor(legend, colorMap, isDarkTheme);
        mapXToDataPoints[x].lineData!.push({
          legend,
          y: series.y?.[index2],
          color,
        });
      }

      yMaxValue = Math.max(yMaxValue, series.y?.[index2]);
    });
  });

  const { chartTitle, xAxisTitle, yAxisTitle } = getTitles(input.layout);

  return {
    data: Object.values(mapXToDataPoints),
    // width: layout?.width,
    // height: layout?.height,
    barWidth: 'auto',
    yMaxValue,
    chartTitle,
    xAxisTitle,
    yAxisTitle,
    mode: 'plotly',
  };
};

export const transformPlotlyJsonToGVBCProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  isDarkTheme?: boolean,
): IGroupedVerticalBarChartProps => {
  const mapXToDataPoints: Record<string, IGroupedVerticalBarChartData> = {};

  input.data.forEach((series: PlotData, index1: number) => {
    series.x?.forEach((x: string | number, index2: number) => {
      if (!mapXToDataPoints[x]) {
        mapXToDataPoints[x] = { name: x.toString(), series: [] };
      }
      if (series.type === 'bar') {
        const legend: string = series.name || `Series ${index1 + 1}`;
        const color = getColor(legend, colorMap, isDarkTheme);

        mapXToDataPoints[x].series.push({
          key: legend,
          data: series.y?.[index2],
          xAxisCalloutData: x as string,
          color,
          legend,
        });
      }
    });
  });

  const { chartTitle, xAxisTitle, yAxisTitle } = getTitles(input.layout);

  return {
    data: Object.values(mapXToDataPoints),
    // width: layout?.width,
    // height: layout?.height,
    barwidth: 'auto',
    chartTitle,
    xAxisTitle,
    yAxisTitle,
    mode: 'plotly',
  };
};

export const transformPlotlyJsonToVBCProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  isDarkTheme?: boolean,
): IVerticalBarChartProps => {
  const vbcData: IVerticalBarChartDataPoint[] = [];

  input.data.forEach((series: PlotData, index: number) => {
    if (!series.x) {
      return;
    }

    const scale = d3ScaleLinear()
      .domain(d3Extent<number>(series.x) as [number, number])
      .nice();
    let [xMin, xMax] = scale.domain();

    xMin = typeof series.xbins?.start === 'number' ? series.xbins.start : xMin;
    xMax = typeof series.xbins?.end === 'number' ? series.xbins.end : xMax;

    const bin = d3Bin().domain([xMin, xMax]);

    if (typeof series.xbins?.size === 'number') {
      const thresholds: number[] = [];
      let th = xMin;
      const precision = d3PrecisionFixed(series.xbins.size);
      const format = d3Format(`.${precision}f`);

      while (th < xMax + series.xbins.size) {
        thresholds.push(parseFloat(format(th)));
        th += series.xbins.size;
      }

      xMin = thresholds[0];
      xMax = thresholds[thresholds.length - 1];
      bin.domain([xMin, xMax]).thresholds(thresholds);
    }

    const buckets = bin(series.x);
    // If the start or end of xbins is specified, then the number of datapoints may become less than x.length
    const totalDataPoints = d3Merge(buckets).length;

    buckets.forEach(bucket => {
      const legend: string = series.name || `Series ${index + 1}`;
      const color: string = getColor(legend, colorMap, isDarkTheme);
      let y = bucket.length;

      if (series.histnorm === 'percent') {
        y = (bucket.length / totalDataPoints) * 100;
      } else if (series.histnorm === 'probability') {
        y = bucket.length / totalDataPoints;
      } else if (series.histnorm === 'density') {
        y = bucket.x0 === bucket.x1 ? 0 : bucket.length / (bucket.x1! - bucket.x0!);
      } else if (series.histnorm === 'probability density') {
        y = bucket.x0 === bucket.x1 ? 0 : bucket.length / (totalDataPoints * (bucket.x1! - bucket.x0!));
      } else if (series.histfunc === 'sum') {
        y = d3Sum(bucket);
      } else if (series.histfunc === 'avg') {
        y = bucket.length === 0 ? 0 : d3Sum(bucket) / bucket.length;
      } else if (series.histfunc === 'min') {
        y = d3Min(bucket)!;
      } else if (series.histfunc === 'max') {
        y = d3Max(bucket)!;
      }

      vbcData.push({
        x: (bucket.x1! + bucket.x0!) / 2,
        y,
        legend,
        color,
        xAxisCalloutData: `[${bucket.x0} - ${bucket.x1})`,
      });
    });
  });

  const { chartTitle, xAxisTitle, yAxisTitle } = getTitles(input.layout);

  return {
    data: vbcData,
    // width: layout?.width,
    // height: layout?.height,
    barWidth: 24,
    supportNegativeData: true,
    chartTitle,
    xAxisTitle,
    yAxisTitle,
    mode: 'plotly',
  };
};

export const transformPlotlyJsonToScatterChartProps = (
  input: PlotlySchema,
  isAreaChart: boolean,
  colorMap: React.MutableRefObject<Map<string, string>>,
  isDarkTheme?: boolean,
): ILineChartProps | IAreaChartProps => {

  const chartData: ILineChartPoints[] = input.data.map((series: PlotData, index: number) => {
    const xValues = series.x;
    const isString = typeof xValues[0] === 'string';
    const isXDate = isDateArray(xValues);
    const isXNumber = isNumberArray(xValues);
    const legend: string = series.name || `Series ${index + 1}`;
    const lineColor = getColor(legend, colorMap, isDarkTheme);

    return {
      legend,
      data: xValues.map((x: string | number, i: number) => ({
        x: isString ? (isXDate ? new Date(x) : isXNumber ? parseFloat(x as string) : x) : x,
        y: series.y[i],
      })),
      color: lineColor,
    };
  });

  const { chartTitle, xAxisTitle, yAxisTitle } = getTitles(input.layout);

  const chartProps: IChartProps = {
    chartTitle,
    lineChartData: chartData,
  };

  if (isAreaChart) {
    return {
      data: chartProps,
      supportNegativeData: true,
      xAxisTitle,
      yAxisTitle,
    } as IAreaChartProps;
  } else {
    return {
      data: chartProps,
      supportNegativeData: true,
      xAxisTitle,
      yAxisTitle,
    } as ILineChartProps;
  }
};

export const transformPlotlyJsonToHorizontalBarWithAxisProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  isDarkTheme?: boolean,
): IHorizontalBarChartWithAxisProps => {

  const chartData: IHorizontalBarChartWithAxisDataPoint[] = input.data
    .map((series: PlotData, index: number) => {
      return series.y.map((yValue: string, i: number) => {
        const color = getColor(yValue, colorMap, isDarkTheme);
        return {
          x: series.x[i],
          y: yValue,
          legend: yValue,
          color,
        };
      });
    })
    .flat();

  const chartHeight: number = input.layout?.height?? 450;
  const margin: number = input.layout?.margin?.l?? 0;
  const padding: number = input.layout?.margin?.pad?? 0;
  const availableHeight: number = chartHeight - margin - padding;
  const numberOfBars = (input.data[0] as PlotData).y.length;
  const scalingFactor = 0.01;
  const gapFactor = 1 / (1 + scalingFactor * numberOfBars);
  const barHeight = availableHeight / (numberOfBars * (1 + gapFactor));

  const { chartTitle, xAxisTitle, yAxisTitle } = getTitles(input.layout);

  return {
    data: chartData,
    chartTitle,
    xAxisTitle,
    yAxisTitle,
    secondaryYAxistitle:
      typeof input.layout?.yaxis2?.title === 'string' ? input.layout?.yaxis2?.title : input.layout?.yaxis2?.title?.text || '',
    barHeight,
    showYAxisLables: true,
    styles: {
      root: {
        height: chartHeight,
        width: typeof input.layout?.width === 'number' ? input.layout.width : 600,
      },
    },
  };
};

export const transformPlotlyJsonToHeatmapProps = (input: PlotlySchema): IHeatMapChartProps => {
  const firstData = input.data[0] as PlotData;
  const heatmapDataPoints: IHeatMapChartDataPoint[] = [];
  let zMin = Number.POSITIVE_INFINITY;
  let zMax = Number.NEGATIVE_INFINITY;

  firstData.x?.forEach((xVal: PlotData, xIdx: number) => {
    firstData.y?.forEach((yVal: any, yIdx: number) => {
      const zVal = firstData.z?.[yIdx]?.[xIdx];

      heatmapDataPoints.push({
        x: input.layout?.xaxis?.type === 'date' ? new Date(xVal) : xVal,
        y: input.layout?.yaxis?.type === 'date' ? new Date(yVal) : yVal,
        value: zVal,
        rectText: zVal,
      });

      zMin = Math.min(zMin, zVal);
      zMax = Math.max(zMax, zVal);
    });
  });
  const heatmapData: IHeatMapChartData = {
    legend: firstData.name,
    data: heatmapDataPoints,
    value: 0,
  };

  // Convert normalized values to actual values
  const domainValuesForColorScale: number[] = firstData.colorscale
    ? firstData.colorscale.map((arr: any) => arr[0] * (zMax - zMin) + zMin)
    : [];
  const rangeValuesForColorScale: string[] = firstData.colorscale ? firstData.colorscale.map((arr: any) => arr[1]) : [];
  const { chartTitle, xAxisTitle, yAxisTitle } = getTitles(input.layout);

  return {
    data: [heatmapData],
    domainValuesForColorScale,
    rangeValuesForColorScale,
    hideLegend: true,
    showYAxisLables: true,
    chartTitle,
    xAxisTitle,
    yAxisTitle,
    sortOrder: 'none',
  };
};

export const transformPlotlyJsonToSankeyProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  isDarkTheme?: boolean,
): ISankeyChartProps => {
  const { link, node } = input.data[0] as SankeyData;
  const validLinks = link?.value //ToDo handle undefined links
    .map((val: number, index: number) => ({
      value: val,
      source: link?.source[index],
      target: link?.target[index],
    }))
    // eslint-disable-next-line @typescript-eslint/no-shadow
    // Filter out negative nodes, unequal nodes and self-references (circular links)
    .filter(x => x.source >= 0 && x.target >= 0 && x.source !== x.target);

  const sankeyChartData = {
    nodes: node.label?.map((label: string, index: number) => {
      const color = getColor(label, colorMap, isDarkTheme);

      return {
        nodeId: index,
        name: label,
        color,
      };
    }),
    links: validLinks.map((validLink: any, index: number) => {
      return {
        ...validLink,
      };
    }),
  };

  const width: number = input.layout?.width?? 440;
  const height: number = input.layout?.height?? 220;
  const styles: ISankeyChartProps['styles'] = {
    root: {
      ...(typeof input.layout?.font?.size === 'number' ? { fontSize: input.layout.font?.size } : {}),
    },
  };
  const shouldResize: number = width + height;

  const { chartTitle } = getTitles(input.layout);

  return {
    data: {
      chartTitle,
      SankeyChartData: sankeyChartData,
    },
    width,
    height,
    styles,
    shouldResize,
    enableReflow: true,
  };
};

export const transformPlotlyJsonToGaugeProps = (
  input: PlotlySchema,
  colorMap: React.MutableRefObject<Map<string, string>>,
  isDarkTheme?: boolean,
): IGaugeChartProps => {
  const firstData = input.data[0] as PlotData;

  const segments = firstData.gauge?.steps?.length
    ? firstData.gauge.steps.map((step: any, index: number): IGaugeChartSegment => {
        const legend = step.name || `Segment ${index + 1}`;
        const color = getColor(legend, colorMap, isDarkTheme);
        return {
          legend,
          size: step.range?.[1] - step.range?.[0],
          color,
        };
      })
    : [
        {
          legend: 'Current',
          size: firstData.value ?? 0 - (firstData.gauge?.range?.[0] ?? 0),
          color: getColor('Current', colorMap, isDarkTheme),
        },
        {
          legend: 'Target',
          size: (firstData.gauge?.range?.[1] ?? 100) - (firstData.value ?? 0),
          color: DataVizPalette.disabled,
        },
      ];

  let sublabel: string | undefined;
  let sublabelColor: string | undefined;
  if (typeof firstData.delta?.reference === 'number') {
    const diff = firstData.value - firstData.delta.reference;
    if (diff >= 0) {
      sublabel = `\u25B2 ${diff}`;
      const color = getColor('inpr', colorMap, isDarkTheme);
      sublabelColor = color;
    } else {
      sublabel = `\u25BC ${Math.abs(diff)}`;
      const color = getColor('inpr', colorMap, isDarkTheme);
      sublabelColor = color;
    }
  }

  const styles: IGaugeChartProps['styles'] = {
    sublabel: {
      fill: sublabelColor,
    },
  };

  const { chartTitle } = getTitles(input.layout);

  return {
    segments,
    chartValue: firstData.value?? 0,
    chartTitle,
    sublabel,
    // range values can be null
    minValue: typeof firstData.gauge?.axis?.range?.[0] === 'number' ? firstData.gauge?.axis?.range?.[0] : undefined,
    maxValue: typeof firstData.gauge?.axis?.range?.[1] === 'number' ? firstData.gauge?.axis?.range?.[1] : undefined,
    chartValueFormat: () => firstData.value,
    width: input.layout?.width?? 440,
    height: input.layout?.height?? 220,
    styles,
    variant: firstData.gauge?.steps?.length ? GaugeChartVariant.MultipleSegments : GaugeChartVariant.SingleSegment,
  };
};

const MAX_DEPTH = 8;
export const sanitizeJson = (jsonObject: any, depth: number = 0): any => {
  if (depth > MAX_DEPTH) {
    throw new Error('Maximum json depth exceeded');
  }

  if (typeof jsonObject === 'object' && jsonObject !== null) {
    for (const key in jsonObject) {
      if (jsonObject.hasOwnProperty(key)) {
        if (typeof jsonObject[key] === 'string') {
          jsonObject[key] = jsonObject[key].replace(/</g, '&lt;').replace(/>/g, '&gt;');
        } else {
          jsonObject[key] = sanitizeJson(jsonObject[key], depth + 1);
        }
      }
    }
  }

  return jsonObject;
};

function isTypedArray(a: any) {
  return ArrayBuffer.isView(a) && !(a instanceof DataView);
}

export function isArrayOrTypedArray(a: any) {
  return Array.isArray(a) || isTypedArray(a);
}

function isPlainObject(obj: any) {
  if (window && window.process && window.process.versions) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  return (
    Object.prototype.toString.call(obj) === '[object Object]' &&
    Object.getPrototypeOf(obj).hasOwnProperty('hasOwnProperty')
  );
}

var arrayAttributes: any[] = [];
var stack: any[] = [];
var isArrayStack: any[] = [];
var baseContainer: any, baseAttrName: any;
/**
 * Interate iteratively through the trace object and find all the array attributes.
 * 1 trace record = 1 series of data
 * @param trace
 */
export function findArrayAttributes(trace: any) {
  // Init basecontainer and baseAttrName
  crawlIntoTrace(baseContainer, 0, '');
}

function crawlIntoTrace(container: any, i: number, astrPartial: any) {
  var item = container[stack[i]];
  var newAstrPartial = astrPartial + stack[i];
  if (i === stack.length - 1) {
    if (isArrayOrTypedArray(item)) {
      arrayAttributes.push(baseAttrName + newAstrPartial);
    }
  } else {
    if (isArrayStack[i]) {
      if (Array.isArray(item)) {
        for (var j = 0; j < item.length; j++) {
          if (isPlainObject(item[j])) {
            crawlIntoTrace(item[j], i + 1, newAstrPartial + '[' + j + '].');
          }
        }
      }
    } else if (isPlainObject(item)) {
      crawlIntoTrace(item, i + 1, newAstrPartial + '.');
    }
  }
}
