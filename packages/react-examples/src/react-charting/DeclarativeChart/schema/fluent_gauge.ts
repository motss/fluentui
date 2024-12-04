/* eslint-disable @typescript-eslint/naming-convention */
export const gaugeSchema = {
  visualizer: 'plotly',
  data: [
    {
      type: 'indicator',
      mode: 'gauge+number+delta',
      value: 420,
      title: { text: 'Speed', font: { size: 24 } },
      delta: { reference: 400, increasing: { color: 'RebeccaPurple' } },
      gauge: {
        axis: { range: [null, 500], tickwidth: 1, tickcolor: 'darkblue' },
        bar: { color: 'darkblue' },
        bgcolor: 'white',
        borderwidth: 2,
        bordercolor: 'gray',
        steps: [
          { range: [0, 250], color: 'cyan' },
          { range: [250, 400], color: 'royalblue' },
        ],
        threshold: {
          line: { color: 'red', width: 4 },
          thickness: 0.75,
          value: 490,
        },
      },
    },
  ],
  layout: {
    width: 500,
    height: 400,
    margin: { t: 25, r: 25, l: 25, b: 25 },
    paper_bgcolor: 'lavender',
    font: { color: 'darkblue', family: 'Arial' },
  },
  frames: [],
};
