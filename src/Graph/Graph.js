import './Graph.css';
import template from './Graph.html';
import Polyline from '../Polyline2/Polyline';
import Checkbox from '../Checkbox/Checkbox';

class Graph {
  constructor(container, dataset) {
    this.data = [];
    this.labels = [];
    this.colors = [];
    this.names = [];
    this.options = [];

    const { columns, types, colors, names } = dataset;
    for (const column of columns) {
      const [id, ...values] = column;
      const name = names[id];
      const color = colors[id];
      const type = types[id];
      if (type === 'line') {
        this.data.push(values);
        this.names.push(name);
        this.colors.push(color);
        this.options.push({ visible: true });
      } else if (type === 'x') {
        this.labels = values;
      }
    }

    const tempElement = document.createElement('div');
    tempElement.innerHTML = template;
    this.DOMElement = tempElement.children[0];
    container.appendChild(this.DOMElement);

    this.sparklineSVG = this.DOMElement.querySelector('.sparkline__svg');
    this.sparklines = this.data.map(d => new Polyline(this.sparklineSVG, d));

    // Checkboxes
    this.checkboxesElement = this.DOMElement.querySelector(
      '.graph__checkboxes'
    );
    this.checkboxes = this.names.map(
      (name, index) =>
        new Checkbox({
          title: name,
          color: this.colors[index],
          container: this.checkboxesElement,
          onChange: this.handleCheckboxChange
        })
    );
  }
  handleCheckboxChange() {}
}

export default Graph;
