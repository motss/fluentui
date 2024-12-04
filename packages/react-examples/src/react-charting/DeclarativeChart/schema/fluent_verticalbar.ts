/* eslint-disable @typescript-eslint/naming-convention */
export const vbcSchema = {
  visualizer: 'plotly',
  data: [
    {
      type: 'bar',
      x: [
        78.31759529851323, 98.09122764296625, 117.86485998741925, 137.63849233187221, 157.41212467632522,
        177.18575702077828, 196.95938936523132, 216.7330217096843, 236.5066540541373, 256.28028639859036,
      ],
      y: [0, 0, 0, 33, 84, 250, 304, 221, 85, 23],
      xaxis: 'x1',
      yaxis: 'y1',
      marker: {
        line: {
          width: 1,
        },
        color: '#0000FF',
      },
      opacity: 1,
      orientation: 'v',
    },
    {
      type: 'bar',
      x: [
        86.22704823629445, 106.00068058074744, 125.77431292520045, 145.54794526965344, 165.32157761410645,
        185.09520995855948, 204.8688423030125, 224.64247464746552, 244.41610699191853, 264.18973933637153,
      ],
      y: [9, 51, 177, 283, 264, 162, 47, 6, 1, 0],
      xaxis: 'x1',
      yaxis: 'y1',
      marker: {
        line: {
          width: 1,
        },
        color: '#007F00',
      },
      opacity: 1,
      orientation: 'v',
    },
  ],
  layout: {
    bargap: 11.864179406671795,
    xaxis1: {
      side: 'bottom',
      type: 'linear',
      range: [50, 300],
      ticks: 'inside',
      anchor: 'y1',
      domain: [0, 1],
      mirror: 'ticks',
      nticks: 6,
      showgrid: false,
      showline: true,
      tickfont: {
        size: 12,
      },
      zeroline: false,
    },
    yaxis1: {
      side: 'left',
      type: 'linear',
      range: [0, 350],
      ticks: 'inside',
      anchor: 'x1',
      domain: [0, 1],
      mirror: 'ticks',
      nticks: 8,
      showgrid: false,
      showline: true,
      tickfont: {
        size: 12,
      },
      zeroline: false,
    },
    hovermode: 'closest',
    showlegend: false,
  },
  frames: [],
};
