import './style.css';

import Graph from './Graph/Graph';

import Sparkline from './Sparkline/Sparkline';
import Polyline from './Polyline/Polyline';
import Slider from './Slider/Slider';
import dataset from '../spec/chart_data.json';
const { colors, columns, names, types } = dataset[0];
const data = columns.slice(1);
const labels = columns[0].slice(1);

//------

const main = document.getElementById('main');
// const charts = dataset.map(item => new Graph(main, item));
new Graph(main, dataset[0]);

//------

const svg = document.getElementById('svg');
const sparkline = new Sparkline(svg, data);

const graph = document.getElementById('graph');
const graphLine = new Polyline(graph, [[0, 0]]);

let [visibleGrid, hiddenGrid] = document.querySelectorAll('.grid');

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

// draw circles
const days = [];
for (let i = 0; i < labels.length; i++) {
  const group = document.createElementNS(graph.namespaceURI, 'g');
  group.classList.add('day');

  const verticalLine = document.createElementNS(graph.namespaceURI, 'line');
  verticalLine.setAttribute('y1', '0');
  verticalLine.setAttribute('y2', '100%');
  verticalLine.classList.add('day__line');
  group.appendChild(verticalLine);

  const circle = document.createElementNS(graph.namespaceURI, 'circle');
  circle.setAttribute('r', '5');
  circle.classList.add('day__point');
  group.appendChild(circle);

  days.push(group);
  graph.appendChild(group);
}
// end --draw circles

let cachedMax, cachedMin, graphData;
let spread = 0;
let spreadDiff = 0;

let animationStart;

let duration = 1000;

let currentSpread = 0;

const slider = new Slider(document.querySelector('.slider'));
slider.onChange(drawGraph);
drawGraph([slider.left, slider.right]);

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

      // Grid
      const GRID_LINE_COUNT = 6;
      const GIRD_LINE_HEIGHT = 17;
      const spreadInGrid = spread - (spread * GIRD_LINE_HEIGHT) / height;
      // hiddenGrid.innerHTML = '';
      for (let i = 0; i < GRID_LINE_COUNT; i++) {
        const index = hiddenGrid.children.length - i - 1;
        const line = hiddenGrid.children[index];
        line.textContent = Math.round((spreadInGrid / GRID_LINE_COUNT) * i);

        // const line = document.createElement('div');
        // line.classList.add('grid__item');
        // line.textContent = Math.round((spreadInGrid / GRID_LINE_COUNT) * i);
        // hiddenGrid.appendChild(line);
      }

      visibleGrid.classList.add('grid--hidden');
      visibleGrid.classList.remove('grid--visible');
      hiddenGrid.classList.remove('grid--hidden');
      hiddenGrid.classList.add('grid--visible');
      const temp = visibleGrid;
      visibleGrid = hiddenGrid;
      hiddenGrid = temp;
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

    // Circles

    graphData.forEach((n, index) => {
      const y = ((n - min) / spread) * height;
      const x = index * (width / (graphData.length - 1));
      const group = days[index];
      group.style.transform = `translateX(${x}px)`;
      const circle = group.children[1];
      // circle.style.transform = `translate(${x}px,${y}px);`;
      circle.style.transform = `translateY(${height - y}px)`;
    });

    // Labels

    // Reset all labels
    for (const text of textElements) {
      text.removeAttribute('style');
      text.style.opacity = 0;
      // text.style.transition = 'opacity 1s linear';
    }

    // Move visible labels
    graphPoints.forEach((point, index) => {
      const text = textElements[startIndex + index];
      text.style.transform = `translateX(${100 + point[0]}px)`;
    });

    const LABEL_WIDTH = 50;
    const viewportLabelCount = Math.floor(width / LABEL_WIDTH);

    // console.log(
    //   viewportLabelCount,
    //   graphPoints.length,
    //   viewportLabelCount / graphPoints.length,
    //   textElements.length,
    //   textElements.length * (viewportLabelCount / graphPoints.length)
    // );

    const totalLabelCount = Math.floor(
      textElements.length * (viewportLabelCount / graphPoints.length)
    );

    let visibleLabels = [...textElements];
    while (visibleLabels.length > totalLabelCount) {
      const newVisisbleLabels = [];
      for (let i = 0; i < visibleLabels.length; i += 2) {
        newVisisbleLabels.push(visibleLabels[i]);
      }
      visibleLabels = newVisisbleLabels;
    }

    // let visibleLabels = [...textElements].filter((v, i) => i % 4 === 0);

    /*
    const labelCount = Math.floor(width / LABEL_WIDTH);
    let step = Math.ceil(graphPoints.length / labelCount / 2);
    //if (step % 2 !== 0) step += 1;
    console.log(graphPoints.length, step);
    let visibleLabels = [...textElements];
    step = 2;
    for (let i = 0; i < step; i++) {
      const newVisisbleLabels = [];
      for (let j = 0; j < visibleLabels.length; j += 2) {
        newVisisbleLabels.push(visibleLabels[j]);
      }
      visibleLabels = newVisisbleLabels;
    }
    console.log(visibleLabels.length);
    */

    /*
    let step = Math.floor(graphPoints.length / labelCount);
    if (step % 2 !== 0) step += 1;
    console.log(textElements.length, step);
    let visibleLabels = [...textElements];
    if (changeType === 'scaleLeft') visibleLabels.reverse();
    visibleLabels = visibleLabels.filter((value, index) =>
      index % step === 0 ? value : false
    );
    */

    /*
    let visibleLabels = textElements.slice(startIndex, endIndex);
    if (changeType === 'scaleLeft') visibleLabels.reverse();
    while (visibleLabels.length > labelCount) {
      const newVisisbleLabels = [];
      for (let i = 0; i < visibleLabels.length; i += 2) {
        newVisisbleLabels.push(visibleLabels[i]);
      }
      visibleLabels = newVisisbleLabels;
    }
    */

    visibleLabels.forEach(text => {
      // text.style.transition = 'opacity 1s linear';
      text.style.opacity = 1;
    });

    /*
    // Hide redundant labels
    const LABEL_WIDTH = 100;
    let nextX = 0;
    graphPoints.forEach(([x, _], index) => {
      if (x >= nextX) {
        nextX = x + LABEL_WIDTH;
        const text = textElements[startIndex + index];
        text.style.opacity = 1;
      }
    });
    */

    /*
    // Show some labels 
    const LABEL_WIDTH = 50;
    const labelCount = Math.floor(width / LABEL_WIDTH);

    for (let i = 0; i < labelCount; i++) {
      const index = Math.floor(
        ((graphPoints.length - 1) / (labelCount - 1)) * i
      );
      const text = textElements[startIndex + index];
      text.style.opacity = 1;
    }
    */
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

if (module.hot) module.hot.accept();
