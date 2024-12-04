/* eslint-disable @typescript-eslint/naming-convention */
export const pieSchema = {
  visualizer: 'plotly',
  data: [
    {
      type: 'pie',
      marker: {
        line: {
          color: '#000000',
          width: 2,
        },
        colors: ['#FEBFB3', '#E1396C', '#96D38C', '#D0F9B1'],
      },
      textfont: {
        size: 20,
      },
      textinfo: 'value',
      hoverinfo: 'label+percent',
      labels: ['Oxygen', 'Hydrogen', 'Carbon_Dioxide', 'Nitrogen'],
      values: [4500, 2500, 1053, 500],
    },
  ],
  layout: {},
  frames: [],
};
