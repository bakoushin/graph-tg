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
    if (checked) {
      data.visible = true;
      data.sparkline.show();
    } else {
      data.visible = false;
      data.sparkline.hide();
    }
    this.data
      .filter(({ visible }) => visible)
      .forEach(({ sparkline }) => sparkline.setBounds(this.bounds));
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
}

export default Graph;
