import dataset from './spec/chart_data.json';
const { colors, columns, names, types } = dataset[0];
const data = columns.slice(1);

const SVG_NS = 'http://www.w3.org/2000/svg';

const root = document.getElementById('root');
const rootHeight = root.clientHeight;

//
const svg = document.getElementById('svg');
svg.style.outline = '1px solid #ccc';
//

data.forEach(c => renderSparkline(c.slice(1), svg));

function renderSparkline(data, element) {
  const { width, height } = element.getBoundingClientRect();
  const normalizedData = normalizeData(data, height);

  const polyline = document.createElementNS(SVG_NS, 'polyline');
  polyline.style = 'fill:none;stroke:#666;stroke-width:1;';

  normalizedData.forEach((item, index) => {
    const point = element.createSVGPoint();
    point.x = index * (width / (normalizedData.length - 1));
    point.y = item;
    polyline.points.appendItem(point);
  });

  element.appendChild(polyline);
}

function normalizeData(data, normalizedInterval) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const interval = max - min;
  return data.map(v => ((v - min) / interval) * normalizedInterval);
}

//const svg = document.createElementNS(SVG_NS, 'svg');

// const data = [10, 5, 30, 15, 25, 45, 17, 32];

const slider = document.querySelector('.slider--frame');
slider.onpointerdown = down_handler;
slider.onpointermove = move_handler;
slider.onpointerup = up_handler;
slider.onpo;

let isMoving = false;
let pointerPosition = null;
let sliderPosition = 0;
let sliderWidth = slider.clientWidth;
let rootWidth = root.clientWidth;

function down_handler(e) {
  isMoving = true;
  pointerPosition = e.clientX;
  sliderWidth = slider.clientWidth;
  rootWidth = root.clientWidth;
  slider.setPointerCapture(e.pointerId);
  console.log('down', pointerPosition, sliderPosition);
}

function move_handler(e) {
  if (!isMoving) return;

  const diff = e.clientX - pointerPosition;
  sliderPosition += diff;

  if (sliderPosition < 0) sliderPosition = 0;
  if (sliderPosition + sliderWidth > rootWidth)
    sliderPosition = rootWidth - sliderWidth;

  slider.style.transform = `translateX(${sliderPosition}px)`;

  console.log('move', pointerPosition, sliderPosition);

  pointerPosition = e.clientX;
}

function up_handler(e) {
  console.log('up');
  isMoving = false;
  pointerPosition = null;
  slider.releasePointerCapture(e.pointerId);
}
