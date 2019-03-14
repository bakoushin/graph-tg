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
  const data = sparkline._data['y0'];
  if (e.target.checked) {
    data.visible = true;
    data.polyline.show();
  } else {
    data.visible = false;
    data.polyline.hide();
  }
  sparkline.onResize();
});

y1.addEventListener('change', e => {
  const data = sparkline._data['y1'];
  if (e.target.checked) {
    data.visible = true;
    data.polyline.show();
  } else {
    data.visible = false;
    data.polyline.hide();
  }
  sparkline.onResize();
});
