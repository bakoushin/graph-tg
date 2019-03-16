import './style.css';
import Sparkline from './Sparkline/Sparkline';
import Polyline from './Polyline/Polyline';
import Slider from './Slider/Slider';
import dataset from '../spec/chart_data.json';
const { colors, columns, names, types } = dataset[0];
const data = columns.slice(1);
const labels = columns[0].slice(1);

const svg = document.getElementById('svg');
const sparkline = new Sparkline(svg, data);

const graph = document.getElementById('graph');
const graphLine = new Polyline(graph, [[0, 0]]);

// draw labels
const textElements = [];
for (const label of labels) {
  const dateStr = dateString(label);

  const text = document.createElementNS(graph.namespaceURI, 'text');
  text.setAttribute('x', '-100');
  text.setAttribute('y', '100%');
  text.classList.add('label');
  const textNode = document.createTextNode(dateStr);
  text.appendChild(textNode);
  graph.appendChild(text);
  textElements.push(text);
}

// -- end -- draw labels

let cachedMax, cachedMin, graphData;
let spread = 0;
let spreadDiff = 0;

let animationStart;

let duration = 1000;

let currentSpread = 0;

const slider = new Slider(document.querySelector('.slider'));
slider.onChange(drawGraph);
drawGraph(slider.position);

function drawGraph([start, end]) {
  requestAnimationFrame(now => {
    const points = sparkline._data['y0'].polyline.points;
    const data = sparkline._data['y0'].data;

    const startIndex = points.findIndex(p => p[0] >= start);
    const endIndex =
      points.length - [...points].reverse().findIndex(p => p[0] <= end) - 1;

    // const startValue = data[startIndex];
    // const endValue = data[endIndex];

    // console.log(startValue, endValue, data[0], data[data.length - 1]);

    const { width, height } = graph.getBoundingClientRect();

    graphData = data.slice(startIndex, endIndex);

    const min = Math.min(...graphData);
    const max = Math.max(...graphData);

    if (min !== cachedMin || max !== cachedMax) {
      cachedMin = min;
      cachedMax = max;

      spread = max - min;
      spreadDiff = spread - currentSpread;

      animationStart = performance.now();

      startAnimateY();
    }

    const elapsedTime = now - animationStart;
    const progress = Math.min(1, elapsedTime / duration);

    currentSpread = spread - spreadDiff * (1 - progress);

    const graphPoints = graphData.map((n, index) => {
      const y = ((n - min) / currentSpread) * height;
      const x = index * (width / (graphData.length - 1));
      return [x, y];
    });

    graphLine.setPoints(graphPoints);

    for (const text of textElements) {
      text.removeAttribute('style');
    }
    graphPoints.forEach((point, index) => {
      const text = textElements[index];
      text.setAttribute('style', `transform: translateX(${100 + point[0]}px)`);
      // text.style.tansform = `translateX(${point.x}px)`;
    });
  });
}

function startAnimateY() {
  const { width, height } = graph.getBoundingClientRect();

  requestAnimationFrame(animateY);

  function animateY(now) {
    const min = cachedMin;
    const max = cachedMax;

    const elapsedTime = now - animationStart;
    const progress = Math.min(1, elapsedTime / duration);

    currentSpread = spread - spreadDiff * (1 - progress);

    const graphPoints = graphData.map((n, index) => {
      const y = ((n - min) / currentSpread) * height;
      const x = index * (width / (graphData.length - 1));
      return [x, y];
    });

    graphLine.setPoints(graphPoints);

    if (progress < 1) {
      requestAnimationFrame(animateY);
    }
  }
}

function dateString(date) {
  return new Date(date).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric'
  });
}

const y0 = document.getElementById('y0');
const y1 = document.getElementById('y1');

y0.addEventListener('change', e => {
  const data = sparkline._data['y0'];
  if (e.target.checked) {
    data.visible = true;
    data.polyline.show();
    graphLine.show();
    graphLine.updatePoints(graphLine.points.map(([x, y]) => [x, y / 10]), 500);
  } else {
    data.visible = false;
    data.polyline.hide();
    graphLine.hide();
    graphLine.updatePoints(graphLine.points.map(([x, y]) => [x, y * 10]), 1000);
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
