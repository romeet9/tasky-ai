export const raycastColors = {
  bg: '#07080a',
  surface: '#101111',
  card: '#1b1c1e',
  white: '#f9f9f9',
  lightGray: '#cecece',
  silver: '#c0c0c0',
  mediumGray: '#9c9c9d',
  dimGray: '#6a6b6c',
  darkGray: '#434345',
  border: '#252829',
  darkBorder: '#2f3031',
  red: '#FF6363',
  blue: '#55b3ff',
  green: '#5fc992',
  yellow: '#ffbc33',
  purple: '#a78bfa',
  cyan: '#22d3ee',
  pink: '#f472b6',
  orange: '#fb923c',
};

export const chartColors = {
  blue: '#55b3ff',
  red: '#FF6363',
  green: '#5fc992',
  yellow: '#ffbc33',
  purple: '#a78bfa',
  cyan: '#22d3ee',
  pink: '#f472b6',
  orange: '#fb923c',
};

export const taskStatusColors = {
  pending: '#ffbc33',
  'in-progress': '#55b3ff',
  completed: '#5fc992',
};

export const providerColors = {
  Groq: '#55b3ff',
  Ollama: '#FF6363',
  Together: '#5fc992',
  OpenRouter: '#ffbc33',
};

export const rechartsConfig = {
  grid: {
    stroke: 'rgba(255, 255, 255, 0.03)',
    strokeWidth: 1,
  },
  axis: {
    stroke: '#434345',
    tick: { fill: '#9c9c9d', fontSize: 12 },
    tickLine: { stroke: '#434345' },
    domainLine: { stroke: '#434345' },
  },
  tooltip: {
    contentStyle: {
      background: '#1b1c1e',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '8px',
      color: '#f9f9f9',
      fontSize: '13px',
      fontWeight: 500,
      letterSpacing: '0.2px',
      boxShadow: 'rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset',
      padding: '10px 14px',
    },
    itemStyle: { color: '#cecece', padding: '2px 0' },
    labelStyle: { color: '#f9f9f9', fontWeight: 600, marginBottom: '4px' },
  },
  legend: {
    fill: '#cecece',
    fontSize: 12,
    iconType: 'circle' as const,
    iconSize: 8,
  },
  line: {
    strokeWidth: 2,
    dot: { r: 3, strokeWidth: 2 },
    activeDot: { r: 5, strokeWidth: 2 },
  },
  area: {
    strokeWidth: 2,
    dot: false,
    activeDot: { r: 4, strokeWidth: 2 },
  },
  bar: {
    radius: [3, 3, 0, 0] as [number, number, number, number],
    maxBarSize: 40,
  },
};

export const chartFormatters = {
  number: (value: number) => value.toLocaleString(),
  thousands: (value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}K` : String(value),
  percentage: (value: number) => `${value.toFixed(1)}%`,
};