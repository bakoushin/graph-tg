import './Graph.css';
import './Grid.css';
import './Polyline.css';
import './Tooltip.css';
import template from './Graph.html';
import Checkbox from '../Checkbox/Checkbox';
import Slider from '../Slider/Slider';

class Graph {
  constructor(container, dataset, title = 'Graph') {
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

    // Header
    const header = this.DOMElement.querySelector('h2');
    header.textContent = title;

    // Main graph
    this.viewBoxWidth = this.labels.length * 10;
    const height = this.spread;

    this.svg = this.DOMElement.querySelector('.graph__svg');
    this.svg.setAttribute('viewBox', `0 0 ${this.viewBoxWidth} ${height}`);

    const sparklineContainer = this.DOMElement.querySelector(
      '.sparkline__container'
    );

    this.data = this.data.map(data => {
      const { values, color } = data;

      const points = values.map((n, index) => {
        const y = (n / this.spread) * height;
        const x = index * (this.viewBoxWidth / (values.length - 1));
        return `${x},${y}`;
      });

      // Graph line
      const line = document.createElementNS(this.svg.namespaceURI, 'polyline');
      line.classList.add('polyline');
      line.style.stroke = color;
      line.style.strokeWidth = 2;
      line.setAttribute('points', points.join(' '));
      this.svg.appendChild(line);

      // Sparkline
      const sparklineSVG = document.createElementNS(
        this.svg.namespaceURI,
        'svg'
      );
      sparklineSVG.setAttribute(
        'viewBox',
        `0 0 ${this.viewBoxWidth} ${height}`
      );
      sparklineSVG.setAttribute('preserveAspectRatio', 'none');
      sparklineSVG.classList.add('sparkline__svg');

      const sparkline = document.createElementNS(
        this.svg.namespaceURI,
        'polyline'
      );
      sparkline.classList.add('polyline');
      sparkline.style.stroke = color;
      sparkline.style.strokeWidth = 1;
      sparkline.setAttribute('points', points.join(' '));
      sparklineSVG.appendChild(sparkline);

      sparklineContainer.appendChild(sparklineSVG);

      return { ...data, line, sparkline: sparklineSVG };
    });

    // Points
    const points = [];
    for (let i = 0; i < this.labels.length; i++) {
      points.push(i * (this.viewBoxWidth / (this.labels.length - 1)));
    }

    const CATCHER_WIDTH = 6;
    points.forEach((x, index) => {
      const rect = document.createElementNS(this.svg.namespaceURI, 'rect');
      rect.setAttribute('width', CATCHER_WIDTH);
      rect.setAttribute('height', '100%');
      rect.setAttribute('x', x - CATCHER_WIDTH / 2);
      rect.setAttribute('y', 0);
      rect.setAttribute('data-index', index);
      rect.classList.add('graph__catcher');
      this.svg.appendChild(rect);
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

    // Labels
    this.labelContainer = this.DOMElement.querySelector('.graph__labels');
    this.labelElements = this.labels.map((timestamp, index) => {
      const element = document.createElement('div');
      element.classList.add('graph__label');
      element.textContent = new Date(timestamp).toLocaleDateString('en', {
        month: 'short',
        day: 'numeric'
      });
      const x = (index * 100) / (this.labels.length - 1);
      element.style.left = `${x}%`;
      this.labelContainer.appendChild(element);
      return element;
    });

    // Grid
    this.hiddenGrid = this.DOMElement.querySelectorAll('.grid')[0];
    this.visibleGrid = this.DOMElement.querySelectorAll('.grid')[1];

    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);

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

    // Init
    slider.setRange(0.75, 1);
  }
  get data() {
    return this._data;
  }
  set data(value) {
    this._data = value;
    this.updateDataIndex();
  }
  get dataIndex() {
    return this._dataIndex;
  }
  set dataIndex(value) {
    this._dataIndex = value;
  }
  get spread() {
    const all = [];
    this.data
      .filter(({ visible }) => visible)
      .forEach(({ values }) => all.push(...values));
    return Math.max(...all);
  }
  updateDataIndex() {
    const dataIndex = {};
    this.data.forEach(data => (dataIndex[data.id] = data));
    this.dataIndex = dataIndex;
  }
  handlePointerOver(e) {
    const { clientX, clientY } = e.targetTouches ? e.targetTouches[0] : e;
    const target = document.elementFromPoint(clientX, clientY);
    if (target.tagName !== 'rect') {
      this.clearTooltip();
    } else {
      if (this.data.filter(({ visible }) => visible).length < 1) {
        return;
      }

      const index = target.getAttribute('data-index');
      const {
        left: targetLeft,
        width: targetWidth,
        height: targetHeight
      } = target.getBoundingClientRect();
      const {
        left: containerLeft,
        width: containerWidth
      } = this.svg.getBoundingClientRect();

      this.initTooltip();

      const dotRadius = parseInt(getComputedStyle(this.marker).width);

      const x = targetLeft + targetWidth / 2 - containerLeft - dotRadius / 2;
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
  handleCheckboxChange({ id, checked }) {
    const data = this.dataIndex[id];
    data.visible = checked;
    this.data.forEach(({ line, sparkline, visible }) => {
      if (visible) {
        line.classList.remove('polyline--hidden');
        sparkline.classList.remove('sparkline__svg--hidden');
      } else {
        line.classList.add('polyline--hidden');
        sparkline.classList.add('sparkline__svg--hidden');
      }
    });
    requestAnimationFrame(() => {
      this.scaleSparklines();
      this.updateFrame();
    });
  }
  handleSliderChange([start, end]) {
    this.frameStart = start;
    this.frameEnd = end;
    requestAnimationFrame(() => {
      this.updateFrame();
      this.updateLabels();
    });
  }
  updateFrame() {
    const start = this.frameStart;
    const end = this.frameEnd;
    const ratio = end - start;
    this.svg.viewBox.baseVal.width = this.viewBoxWidth * ratio;
    this.svg.viewBox.baseVal.x = this.viewBoxWidth * start;

    const lastIndex = this.data[0].values.length - 1;
    this.startIndex = Math.floor(lastIndex * start);
    this.endIndex = Math.ceil(lastIndex * end);

    const newSpread = Math.max(
      ...this.data
        .filter(({ visible }) => visible)
        .map(({ values }) => values.slice(this.startIndex, this.endIndex))
        .map(frame => Math.max(...frame))
    );

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
    const GRID_LINE_COUNT = 6;

    const { height } = this.svg.getBoundingClientRect();
    const { height: lineHeight } = this.DOMElement.querySelector(
      '.grid__item'
    ).getBoundingClientRect();

    const spreadInGrid =
      this.cachedSpread - (this.cachedSpread * lineHeight) / height;
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
  scaleSparklines() {
    const start = performance.now();
    const duration = 150;
    const sparklines = this.data
      .filter(({ visible }) => visible)
      .map(({ sparkline }) => ({
        sparkline,
        diff: this.spread - sparkline.viewBox.baseVal.height
      }));

    const scale = now => {
      const progress = Math.min(1, (now - start) / duration);

      sparklines.forEach(({ sparkline, diff }) => {
        sparkline.viewBox.baseVal.height = this.spread - diff * (1 - progress);
      });

      if (progress < 1) {
        requestAnimationFrame(scale);
      }
    };
    requestAnimationFrame(scale);
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
  updateLabels() {
    const start = this.frameStart;
    const end = this.frameEnd;
    const ratio = end - start;

    const viewportWidth = this.DOMElement.clientWidth;

    const newWidth = Math.round(viewportWidth / ratio);
    const newOffset = -(newWidth * start);

    this.labelContainer.style.transform = `translateX(${newOffset}px)`;

    const currentWidth = parseFloat(this.labelContainer.style.width);

    if (currentWidth !== newWidth) {
      this.labelContainer.style.width = `${newWidth}px`;

      const LABEL_WIDTH = 80;
      const viewportLabelCount = Math.floor(viewportWidth / LABEL_WIDTH);
      const visibleElementsCount = this.endIndex - this.startIndex;
      const totalLabelCount = Math.floor(
        this.labelElements.length * (viewportLabelCount / visibleElementsCount)
      );

      this.labelElements.forEach(label => (label.style.opacity = 0));

      let visibleLabels = this.labelElements;
      while (visibleLabels.length > totalLabelCount) {
        visibleLabels = visibleLabels.filter((_, index) => index % 2 === 0);
      }

      visibleLabels.forEach(label => (label.style.opacity = 1));
    }
  }
}

export default Graph;
