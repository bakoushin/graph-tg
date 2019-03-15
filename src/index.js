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

const add = document.getElementById('add');
add.addEventListener('click', () => {
  const data = [
    37,
    20,
    32,
    39,
    32,
    35,
    19,
    65,
    36,
    62,
    113,
    69,
    120,
    60,
    51,
    49,
    71,
    122,
    149
  ];

  const newPoints = sparkline.calculatePoints(data);

  sparkline._data['y0'].data = [...data, ...sparkline._data['y0'].data];
  const allPoints = sparkline.calculatePoints(sparkline._data['y0'].data);

  sparkline._data['y0'].polyline.add(newPoints);
  sparkline._data['y0'].polyline.update(allPoints);
  // sparkline._data['y0'].data = [...data, ...sparkline._data['y0'].data];
  // sparkline.onResize();
});
