import './Graph.css';
import './Grid.css';
import './Tooltip.css';
import template from './Graph.html';
import Polyline from '../Polyline2/Polyline';
import Checkbox from '../Checkbox/Checkbox';
import Slider from '../Slider/Slider';

const GRID_LINE_COUNT = 6;
const GRID_LINE_HEIGHT = 17;

class Graph {
  constructor(container, dataset) {
    this.data = [];

    const { columns, types, colors, names } = dataset;
    for (const column of columns) {
      const [id, ...values] = column;
      const type = types[id];
      if (type === 'line') {
        const title = names[id];
        const color = colors[id];
        this.data = [...this.data, { id, values, title, color, visible: true }];
      } else if (type === 'x') {
        this.labels = [...values];
      }
    }

    const tempElement = document.createElement('div');
    tempElement.innerHTML = template;
    this.DOMElement = tempElement.children[0];
    container.appendChild(this.DOMElement);

    this.svg = this.DOMElement.querySelector('.graph__svg');

    // -- viewbox
    const width = 1000;
    const height = this.spread;

    this.svg.setAttribute('viewBox', `0 0 1000 ${height}`);

    this.data = this.data.map(data => {
      const { values, color } = data;

      const points = values.map((n, index) => {
        const y = (n / this.spread) * height;
        const x = index * (width / (values.length - 1));
        return `${x},${y}`;
      });

      const polyline = document.createElementNS(
        this.svg.namespaceURI,
        'polyline'
      );
      polyline.classList.add('polyline');
      polyline.style.stroke = color;
      polyline.style.strokeWidth = 2;
      polyline.setAttribute('points', points.join(' '));

      this.svg.appendChild(polyline);
      return { ...data, line: polyline };
    });

    const points = this.labels.map((n, index) => {
      const x = index * (width / (this.labels.length - 1));
      return x;
    });

    points.forEach((x, index) => {
      const line = document.createElementNS(this.svg.namespaceURI, 'line');
      line.setAttribute('y1', '0');
      line.setAttribute('y2', '100%');
      line.setAttribute('x1', x);
      line.setAttribute('x2', x);
      line.setAttribute('data-index', index);
      line.classList.add('graph__catcher-line');
      this.svg.appendChild(line);
    });

    this.handlePointerOver = this.handlePointerOver.bind(this);
    this.handlePointerOut = this.handlePointerOut.bind(this);
    if (window.PointerEvent) {
      this.svg.addEventListener('pointerover', this.handlePointerOver);
      this.svg.addEventListener('pointerout', this.handlePointerOut);
    } else {
      this.svg.addEventListener('touchmove', this.handlePointerOver);
      this.svg.addEventListener('touchend', this.handlePointerOut);
      this.svg.addEventListener('mouseover', this.handlePointerOver);
      this.svg.addEventListener('mouseout', this.handlePointerOut);
    }

    // -- viewbox

    this.hiddenGrid = this.DOMElement.querySelectorAll('.grid')[0];
    this.visibleGrid = this.DOMElement.querySelectorAll('.grid')[1];

    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);

    // Sparklines
    const spread = this.spread;
    const sparklinesSVG = this.DOMElement.querySelector('.sparkline__svg');
    this.data = this.data.map(data => {
      const { values, color } = data;
      const sparkline = new Polyline({
        values,
        spread,
        color,
        width: 1,
        svgContainer: sparklinesSVG
      });
      return { ...data, sparkline };
    });

    // Slider
    const slider = new Slider(this.DOMElement.querySelector('.slider'));
    slider.onChange(this.handleSliderChange);

    // Checkboxes
    const checkboxContainer = this.DOMElement.querySelector(
      '.graph__checkbox-container'
    );
    this.data = this.data.map(data => {
      const { id, title, color } = data;
      const checkbox = new Checkbox({
        id,
        title,
        color,
        container: checkboxContainer,
        onChange: this.handleCheckboxChange
      });
      return { ...data, checkbox };
    });
  }
  handlePointerOver(e) {
    e.preventDefault();
    const { clientX, clientY } = e.targetTouches ? e.targetTouches[0] : e;
    const target = document.elementFromPoint(clientX, clientY);
    if (target.tagName !== 'line') {
      this.clearTooltip();
    } else {
      if (this.data.filter(({ visible }) => visible).length < 1) {
        return;
      }

      const index = target.getAttribute('data-index');
      const {
        left: targetLeft,
        height: targetHeight
      } = target.getBoundingClientRect();
      const {
        left: containerLeft,
        width: containerWidth
      } = this.svg.getBoundingClientRect();

      this.initTooltip();

      const dotRadius = parseInt(getComputedStyle(this.marker).width);

      const x = targetLeft - containerLeft - dotRadius / 2;
      this.marker.style.transform = `translateX(${x}px)`;

      const dots = this.marker.querySelectorAll('.graph__dot');
      const tooltip = this.marker.querySelector('.tooltip');
      const tooltipHeader = this.marker.querySelector('.tooltip__header');
      const tooltipValues = this.marker.querySelectorAll('.tooltip__value');

      this.data
        .filter(({ visible }) => visible)
        .map(({ values }) => values[index])
        .forEach((value, index) => {
          const y =
            targetHeight -
            (value / this.currentSpread) * targetHeight -
            dotRadius / 2;

          const dot = dots[index];
          dot.style.transform = `translateY(${y}px)`;

          const tooltipValue = tooltipValues[index];
          tooltipValue.textContent = value;
        });

      const tooltipWidth = tooltip.getBoundingClientRect().width;

      let tooltipOffset = 0;
      if (x + tooltipWidth / 2 + dotRadius > containerWidth) {
        tooltipOffset = Math.min(
          0,
          containerWidth - (x + tooltipWidth / 2) - dotRadius
        );
      }
      if (x - tooltipWidth / 2 < 0) {
        tooltipOffset = Math.max(0, tooltipWidth / 2 - x);
      }
      tooltip.style.transform = `translateX(${tooltipOffset}px)`;

      const date = new Date(this.labels[index]).toLocaleDateString('en', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      tooltipHeader.textContent = date;
    }
  }
  handlePointerOut(e) {
    this.clearTooltip();
  }
  initTooltip() {
    if (this.marker) {
      return;
    }
    this.marker = document.createElement('div');
    this.marker.classList.add('graph__marker');

    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    this.marker.appendChild(tooltip);

    const header = document.createElement('h3');
    header.classList.add('tooltip__header');
    tooltip.appendChild(header);

    const items = document.createElement('div');
    items.classList.add('tooltip__items');
    tooltip.appendChild(items);

    this.data
      .filter(({ visible }) => visible)
      .forEach(({ color, title }) => {
        const dot = document.createElement('div');
        dot.classList.add('graph__dot');
        dot.style.borderColor = color;
        this.marker.appendChild(dot);

        const item = document.createElement('div');
        item.classList.add('tooltip__item');
        item.style.color = color;
        item.textContent = title;

        const value = document.createElement('div');
        value.classList.add('tooltip__value');
        item.insertAdjacentElement('afterbegin', value);

        items.appendChild(item);
      });
    this.svg.parentElement.appendChild(this.marker);
  }
  clearTooltip() {
    if (!this.marker) {
      return;
    }

    this.marker.remove();
    this.marker = null;
  }
  get data() {
    return this._data;
  }
  set data(value) {
    this._data = value;
    this.updateDataIndex();
  }
  updateDataIndex() {
    const dataIndex = {};
    this.data.forEach(data => (dataIndex[data.id] = data));
    this.dataIndex = dataIndex;
  }
  get dataIndex() {
    return this._dataIndex;
  }
  set dataIndex(value) {
    this._dataIndex = value;
  }
  handleCheckboxChange({ id, checked }) {
    const data = this.dataIndex[id];
    data.visible = checked;
    this.data.forEach(({ line, sparkline, visible }) => {
      if (visible) {
        line.classList.remove('polyline--hidden');
        sparkline.show();
        sparkline.setSpread(this.spread);
      } else {
        line.classList.add('polyline--hidden');
        sparkline.hide();
      }
    });
    this.updateFrame();
  }
  handleSliderChange([start, end]) {
    this.frameStart = start;
    this.frameEnd = end;
    this.updateFrame();
  }
  updateFrame() {
    const start = this.frameStart;
    const end = this.frameEnd;
    const ratio = end - start;
    this.svg.viewBox.baseVal.width = 1000 * ratio;
    this.svg.viewBox.baseVal.x = 1000 * start;

    const lastIndex = this.data[0].values.length - 1;
    const startIndex = Math.floor(lastIndex * start);
    const endIndex = Math.ceil(lastIndex * end);

    const newSpread = Math.max(
      ...this.data
        .filter(({ visible }) => visible)
        .map(({ values }) => values.slice(startIndex, endIndex))
        .map(frame => Math.max(...frame))
    );

    this.cachedSpread = this.cachedSpread || newSpread;
    this.currentSpread = this.currentSpread || newSpread;

    if (this.cachedSpread !== newSpread) {
      this.spreadDiff = newSpread - this.currentSpread;
      this.cachedSpread = newSpread;

      if (newSpread !== -Infinity) {
        this.scaleGraph();
      }
      this.updateGrid();
    }
  }
  updateGrid() {
    const height = this.svg.clientHeight;

    const spreadInGrid =
      this.cachedSpread - (this.cachedSpread * GRID_LINE_HEIGHT) / height;
    for (let i = 0; i < GRID_LINE_COUNT; i++) {
      const index = this.hiddenGrid.children.length - i - 1;
      const line = this.hiddenGrid.children[index];
      const value = Math.round((spreadInGrid / (GRID_LINE_COUNT - 1)) * i);
      line.textContent = Number.isNaN(value) ? '' : value;
    }

    this.visibleGrid.classList.add('grid--hidden');
    this.visibleGrid.classList.remove('grid--visible');
    this.hiddenGrid.classList.remove('grid--hidden');
    this.hiddenGrid.classList.add('grid--visible');
    const temp = this.visibleGrid;
    this.visibleGrid = this.hiddenGrid;
    this.hiddenGrid = temp;
  }
  scaleGraph() {
    const start = performance.now();
    const duration = 150;
    const scale = now => {
      const progress = Math.min(1, (now - start) / duration);
      this.currentSpread = this.cachedSpread - this.spreadDiff * (1 - progress);

      this.svg.viewBox.baseVal.height = this.currentSpread;

      if (progress < 1) {
        requestAnimationFrame(scale);
      }
    };
    requestAnimationFrame(scale);
  }
  get spread() {
    const all = [];
    this.data
      .filter(({ visible }) => visible)
      .forEach(({ values }) => all.push(...values));
    return Math.max(...all);
  }
  get bounds() {
    const all = [];
    this.data
      .filter(({ visible }) => visible)
      .forEach(({ values }) => all.push(...values));
    return {
      min: Math.min(...all),
      max: Math.max(...all)
    };
  }
  get frameSpread() {
    const all = [];
    this.data
      .filter(({ visible }) => visible)
      .forEach(({ frame }) => all.push(...frame));
    return Math.max(...all);
  }
  updateFrames([start, end]) {
    this.data = this.data.map(data => {
      const { values, sparkline } = data;

      // TODO: Maybe ratio from width may work
      // e.g. start = .25, end .75
      // take indices: length-1*.25 and length-1*.75
      const startIndex = sparkline.points.findIndex(p => p[0] >= start);
      const endIndex =
        sparkline.points.length -
        [...sparkline.points].reverse().findIndex(p => p[0] <= end) -
        1;

      const frame = values.slice(startIndex, endIndex);
      return { ...data, frame };
    });
    this.data.map(({ frame }) => this.drawFrame(frame));
  }
  drawFrame(frame) {
    requestAnimationFrame(now => {
      const { width, height } = graph.getBoundingClientRect();

      // On spread change
      if (this.frameSpread !== this.cachedFrameSpread) {
        this.cachedFrameSpread = this.frameSpread;

        this.currentSpread = this.currentSpread || this.cachedFrameSpread;
        this.spreadDiff = this.cachedFrameSpread - this.currentSpread;

        // Start line transition
        animationStart = performance.now();

        // Update grid
        const spreadInGrid =
          this.frameSpread - (this.frameSpread * GRID_LINE_HEIGHT) / height;
        for (let i = 0; i < GRID_LINE_COUNT; i++) {
          const index = this.hiddenGrid.children.length - i - 1;
          const line = this.hiddenGrid.children[index];
          line.textContent = Math.round((spreadInGrid / GRID_LINE_COUNT) * i);
        }

        this.visibleGrid.classList.add('grid--hidden');
        this.visibleGrid.classList.remove('grid--visible');
        this.hiddenGrid.classList.remove('grid--hidden');
        this.hiddenGrid.classList.add('grid--visible');
        const temp = this.visibleGrid;
        this.visibleGrid = this.hiddenGrid;
        this.hiddenGrid = temp;
      }

      requestAnimationFrame(this.animateY);

      // Markers
      this.data
        .filter(({ visible }) => visible)
        .forEach(({ frame, color }, columnIndex) => {
          frame.forEach((n, index) => {
            const x = index * (width / (frame.length - 1));
            const y = (n / this.frameSpread) * height;
            const group = this.markers[index];
            group.style.transform = `translateX(${x}px)`;
            const circle = group.children[columnIndex + 1];
            circle.style.transform = `translateY(${height - y}px)`;
            circle.style.stroke = color;
          });
        });

      // Labels
      /*
      // Reset all labels
      for (const text of textElements) {
        text.removeAttribute('style');
        text.style.opacity = 0;
      }

      // Move visible labels
      this.data[0].forEach((point, index) => {
        const text = textElements[startIndex + index];
        text.style.transform = `translateX(${100 + point[0]}px)`;
      });

      const LABEL_WIDTH = 50;
      const viewportLabelCount = Math.floor(width / LABEL_WIDTH);

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

      visibleLabels.forEach(text => {
        text.style.opacity = 1;
      });
      */
    });
  }
  animateY(now) {
    const progress = Math.min(1, (now - animationStart) / duration);
    this.currentSpread =
      this.cachedFrameSpread - this.spreadDiff * (1 - progress);

    this.data.forEach(({ frame, line }) => {
      // Lines
      line.setData({ values: frame, spread: this.currentSpread });
    });

    if (progress < 1) {
      requestAnimationFrame(this.animateY);
    }
  }
}

export default Graph;
