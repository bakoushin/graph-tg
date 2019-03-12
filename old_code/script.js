console.log('Hello');
import data from './spec/chart_data.json';
console.log(data);

const SVG_NS = 'http://www.w3.org/2000/svg';

const slider = document.querySelector('.slider');

const svg = document.createElementNS(SVG_NS, 'svg');
svg.style.width = '100%';
svg.style.height = '100%';
// svg.setAttribute('viewBox', '0 0 844 44');
// svg.setAttributeNS(SVG_NS, 'preserveAspectRatio', 'none');

const { colors, columns, names, types } = data[0];

for (let c of Object.entries(colors)) console.log(c);

const keys = Object.entries(types)
  .filter(([_, value]) => value === 'line')
  .map(([key, _]) => key);

for (const column of columns.slice(1)) {
  const columnKey = column[0];
  const color = colors[columnKey];

  const polyline = document.createElementNS(SVG_NS, 'polyline');
  polyline.style.fill = 'none';
  polyline.style.stroke = color;

  const values = column.slice(1);
  const maxValue = values.reduce((max, value) => (value > max ? value : max));
  const minValue = values.reduce((min, value) => (value < min ? value : min));
  const interval = maxValue - minValue;

  const sliderHeight = slider.clientHeight;
  const sliderWidth = slider.clientWidth;

  const normValues = values.map(
    v => sliderHeight - ((v - minValue) / interval) * sliderHeight
  );

  const step = sliderWidth / normValues.length;
  //   console.log(normValues.length * step);
  normValues.forEach((value, index) => {
    const x = index * step;
    const point = svg.createSVGPoint();
    point.x = x;
    point.y = value;
    polyline.points.appendItem(point);
  });

  svg.appendChild(polyline);
}

slider.appendChild(svg);

//const graph
