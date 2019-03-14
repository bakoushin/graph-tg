import dataset from '../spec/chart_data.json';
const { colors, columns, names, types } = dataset[0];
const data = columns.slice(1);

const SVG_NS = 'http://www.w3.org/2000/svg';

const root = document.getElementById('root');
const rootHeight = root.clientHeight;

//
const svg = document.getElementById('svg');
svg.style.outline = '1px solid #ccc';
//

//renderSparklines(data, svg);
const sparklines = renderSparklines([[1, 10, 2, 8, 3, 5, 7]], svg);

console.log(sparklines);

function renderSparklines(data, element) {
  const { width, height } = element.getBoundingClientRect();
  const normalizedData = normalizeData(data, height);

  let sparklines = [];

  for (const col of normalizedData) {
    const polyline = document.createElementNS(SVG_NS, 'polyline');
    polyline.style = 'fill:none;stroke:#666;stroke-width:1;';

    col.forEach((n, index) => {
      const point = element.createSVGPoint();
      point.x = index * (width / (col.length - 1));
      point.y = n;
      polyline.points.appendItem(point);
    });

    element.appendChild(polyline);

    sparklines.push(polyline);
  }

  return sparklines;
}

function normalizeData(data, normalizedInterval) {
  const onlyNumbers = data.map(col =>
    col.filter(n => !Number.isNaN(Number(n)))
  );

  const allData = onlyNumbers.reduce((all, col) => {
    all.push(...col);
    return all;
  });

  const min = Math.min(...allData);
  const max = Math.max(...allData);
  const interval = max - min;

  const normalizedData = onlyNumbers.map(col =>
    col.map(n => ((n - min) / interval) * normalizedInterval)
  );

  return normalizedData;
}

animateJS([0, 1, 0, 1, 0, 1, 0], sparklines[0]);

function animateJS(data, sparkline) {
  const duration = 1000; // ms
  const animationData = data.map((n, i) => {
    const diff = n - sparkline.points[i].y;
    const step = (diff / duration) * 20;
    return { n, step };
  });

  console.log(animationData);
  animate();
  function animate() {
    let continueAnimation = false;
    for (let i = 0; i < animationData.length; i++) {
      if (sparkline.points[i].y !== animationData[i].n) {
        let n = sparkline.points[i].y + animationData[i].step;
        if (animationData[i].step > 0) {
          n = Math.min(animationData[i].n, n);
        } else if (animationData[i].step < 0) {
          n = Math.max(animationData[i].n, n);
          // console.log(animationData[i].n, n);
        }
        // console.log(n, sparkline.points[i].y, animationData[i].step);
        sparkline.points[i].y = n;
        continueAnimation = true;
      }
    }
    if (continueAnimation) {
      requestAnimationFrame(animate);
    }
  }
  console.log('ssss', sparkline.points[1], sparkline.points.length);
}

// animateChange([0, 1, 0, 1, 0, 1, 0], sparklines[0]);
// animateChange([10, 1, 10, 1, 10, 1, 10], sparklines[0]);

function animateChange(data, sparkline) {
  const { width, height } = svg.getBoundingClientRect();

  const points = data
    .map((n, index) => {
      const x = index * (width / (data.length - 1));
      const y = n;
      return `${x},${y}`;
    })
    .join(' ');

  const animate = document.createElementNS(SVG_NS, 'animate');
  animate.setAttribute('attributeName', 'points');
  animate.setAttribute('attributeType', 'XML');
  animate.setAttribute('to', points);
  animate.setAttribute('dur', '1s');
  animate.setAttribute('repeatCount', '1');
  animate.setAttribute('fill', 'freeze');
  sparkline.appendChild(animate);
  animate.beginElement();
}

//const svg = document.createElementNS(SVG_NS, 'svg');

// const data = [10, 5, 30, 15, 25, 45, 17, 32];

const slider = document.querySelector('.slider--frame');
// slider.onpointerdown = down_handler;
// slider.onpointermove = move_handler;
// slider.onpointerup = up_handler;

// let isMoving = false;
// let pointerPosition = null;
// let sliderPosition = 0;
// let sliderWidth = slider.clientWidth;
// let rootWidth = root.clientWidth;

// function down_handler(e) {
//   isMoving = true;
//   pointerPosition = e.clientX;
//   sliderWidth = slider.clientWidth;
//   rootWidth = root.clientWidth;
//   slider.setPointerCapture(e.pointerId);
//   console.log('down', pointerPosition, sliderPosition);
// }

// function move_handler(e) {
//   if (!isMoving) return;

//   const diff = e.clientX - pointerPosition;
//   sliderPosition += diff;

//   if (sliderPosition < 0) sliderPosition = 0;
//   if (sliderPosition + sliderWidth > rootWidth)
//     sliderPosition = rootWidth - sliderWidth;

//   requestAnimationFrame(() => {
//     e.target.style.transform = `translateX(${sliderPosition}px)`;
//   });
//   console.log('move', pointerPosition, sliderPosition);

//   pointerPosition = e.clientX;
// }

// function up_handler(e) {
//   console.log('up');
//   isMoving = false;
//   pointerPosition = null;
//   slider.releasePointerCapture(e.pointerId);
// }

// SLIDER LEFT RIGHT CONTROLS
let isMoving = false;
let pointerPosition = null;
let sliderPosition = 0;
let sliderWidth = slider.clientWidth;
let rootWidth = root.clientWidth;
let initialSliderWidth = sliderWidth;

const sliderControlRight = document.querySelector('.slider--control__right');
sliderControlRight.onpointerdown = e => {
  isMoving = true;
  pointerPosition = e.clientX;
  sliderWidth = slider.clientWidth;
  rootWidth = root.clientWidth;
  e.target.setPointerCapture(e.pointerId);
  console.log('left down', pointerPosition, sliderPosition, sliderWidth);
};
sliderControlRight.onpointermove = e => {
  if (!isMoving) return;

  const diff = e.clientX - pointerPosition;
  sliderWidth += diff;
  // const scale = sliderWidth / initialSliderWidth;
  // console.log(sliderWidth, initialSliderWidth, scale);
  // sliderPosition = diff;

  // if (sliderPosition < 0) sliderPosition = 0;
  // if (sliderPosition + sliderWidth > rootWidth)
  //   sliderPosition = rootWidth - sliderWidth;

  requestAnimationFrame(() => {
    slider.style.transformOrigin = 'left';
    // slider.style.transform = `scaleX(${scale})`;
    slider.style.width = `${sliderWidth}px`;
    // slider.style.transform = `translateX(${sliderPosition}px)`;
    console.log('width', sliderWidth, slider.getBoundingClientRect().width);
  });

  console.log('left move', pointerPosition, sliderPosition);

  pointerPosition = e.clientX;
};
sliderControlRight.onpointerup = e => {
  console.log('left up');
  isMoving = false;
  pointerPosition = null;
  e.target.releasePointerCapture(e.pointerId);
};
