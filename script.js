const SVG_NS = 'http://www.w3.org/2000/svg';

const root = document.getElementById('root');

//const svg = document.createElementNS(SVG_NS, 'svg');

const data = [10, 5, 30, 15, 25, 45, 17, 32];

const svg = document.getElementById('svg');
svg.style.outline = '1px solid #ccc';

svgWidth = svg.getBoundingClientRect().width;

const polyline = document.createElementNS(SVG_NS, 'polyline');
polyline.style = 'fill:none;stroke:#666;stroke-width:1;';

data.forEach((item, index) => {
  const point = svg.createSVGPoint();
  point.x = index * (svgWidth / (data.length - 1));
  point.y = item;
  polyline.points.appendItem(point);
});

svg.appendChild(polyline);

const slider = document.querySelector('.slider--frame');
slider.onpointerdown = down_handler;
slider.onpointermove = move_handler;
slider.onpointerup = up_handler;

let isMoving = false;
let pointerPosition = null;
let sliderPosition = 0;

function down_handler(e) {
  console.log('down');
  isMoving = true;
  pointerPosition = e.clientX;
}

function move_handler(e) {
  if (!isMoving) return;
  console.log('move');

  const diff = e.clientX - pointerPosition;
  sliderPosition += diff;
  slider.style.transform = `translateX(${sliderPosition}px)`;

  pointerPosition = e.clientX;
}

function up_handler() {
  console.log('up');
  isMoving = false;
  pointerPosition = null;
}
