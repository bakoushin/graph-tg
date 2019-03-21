import './Graph.css';
import './Grid.css';
import template from './Graph.html';
import Polyline from '../Polyline2/Polyline';
import Checkbox from '../Checkbox/Checkbox';
import Slider from '../Slider/Slider';

const GRID_LINE_COUNT = 6;
const GRID_LINE_HEIGHT = 17;

let animationStart;
let duration = 1000;

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

    this.hiddenGrid = this.DOMElement.querySelectorAll('.grid')[0];
    this.visibleGrid = this.DOMElement.querySelectorAll('.grid')[1];

    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);

    this.drawFrame = this.drawFrame.bind(this);
    this.animateY = this.animateY.bind(this);

    // Lines
    this.data = this.data.map(data => {
      const { frame, color } = data;
      const line = new Polyline({
        color,
        width: 2,
        svgContainer: this.svg
      });
      return { ...data, line };
    });

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
        line.show();
        line.setSpread(this.frameSpread);
        sparkline.show();
        sparkline.setSpread(this.spread);
      } else {
        line.hide();
        sparkline.hide();
      }
    });
  }
  handleSliderChange([start, end]) {
    //console.log(start, end);
    this.updateFrames([start, end]);
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
        /*
        const spreadInGrid =
          this.frameSpread - (this.spread * GRID_LINE_HEIGHT) / height;
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
        */
      }

      requestAnimationFrame(this.animateY);

      // this.data
      //   .filter(({ visible }) => visible)
      //   .forEach(({ frame, line }) => {
      //     // Circles
      //     frame.forEach((n, index) => {
      //       const y = (n / this.frameSpread) * height;
      //       const x = index * (width / (frame.length - 1));
      //       const group = days[index];
      //       group.style.transform = `translateX(${x}px)`;
      //       const circle = group.children[1];
      //       circle.style.transform = `translateY(${height - y}px)`;
      //     });
      //   });

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
