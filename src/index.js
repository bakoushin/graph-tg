import './style.css';
import Sparkline from './Sparkline/Sparkline';
import dataset from '../spec/chart_data.json';
const { colors, columns, names, types } = dataset[0];
const data = columns.slice(1);

const svg = document.getElementById('svg');
svg.style.outline = '1px solid salmon';

const sparkline = new Sparkline(svg, data);

const y0 = document.getElementById('y0');
const y1 = document.getElementById('y1');

y0.addEventListener('change', e => {
  if (e.target.checked) {
    sparkline._polylines[0].polyline.show();
  } else {
    sparkline._polylines[0].polyline.hide();
  }
});

y1.addEventListener('change', e => {
  if (e.target.checked) {
    sparkline._polylines[1].polyline.show();
  } else {
    sparkline._polylines[1].polyline.hide();
  }
});
