import './Graph.css';
import template from './Graph.html';
import Polyline from '../Polyline2/Polyline';
import Checkbox from '../Checkbox/Checkbox';
import Slider from '../Slider/Slider';

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

    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);

    // Sparklines
    const { min, max } = this.bounds;
    const sparklinesSVG = this.DOMElement.querySelector('.sparkline__svg');
    this.data = this.data.map(data => {
      const { values, color } = data;
      const sparkline = new Polyline({
        values,
        min,
        max,
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
    this.data.forEach(({ sparkline, visible }) => {
      if (visible) {
        sparkline.show();
        sparkline.setBounds(this.bounds);
      } else {
        sparkline.hide();
      }
    });
  }
  handleSliderChange([start, end]) {
    //console.log(start, end);
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
  draw(id, [start, end]) {
    requestAnimationFrame(now => {
      const data = this.dataIndex[id];

      // ex. data
      const values = data.values;

      // ex. values
      const sparklinePoints = data.sparkline.points;

      const startIndex = sparklinePoints.findIndex(p => p[0] >= start);
      const endIndex =
        sparklinePoints.length -
        [...sparklinePoints].reverse().findIndex(p => p[0] <= end) -
        1;

      const { width, height } = graph.getBoundingClientRect();

      const frameData = data.slice(startIndex, endIndex);

      const min = Math.min(...frameData);
      const max = Math.max(...frameData);

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
        for (let i = 0; i < GRID_LINE_COUNT; i++) {
          const index = hiddenGrid.children.length - i - 1;
          const line = hiddenGrid.children[index];
          line.textContent = Math.round((spreadInGrid / GRID_LINE_COUNT) * i);
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
        // text.style.transition = 'opacity 1s linear';
        text.style.opacity = 1;
      });
    });
  }
  startAnimateY() {
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
}

export default Graph;
