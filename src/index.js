import Sparkline from './Sparkline/Sparkline';
import dataset from '../spec/chart_data.json';
const { colors, columns, names, types } = dataset[0];
const data = columns.slice(1);

const svg = document.getElementById('svg');
svg.style.outline = '1px solid salmon';

const sparkline = new Sparkline(svg, data);
