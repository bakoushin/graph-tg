import './Graph.css';
import template from './Graph.html';
import Polyline from '../Polyline2/Polyline';

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

    this.DOMElement = document.createElement('section');
    this.DOMElement.innerHTML = template;
    container.appendChild(this.DOMElement);

    this.sparklineSVG = this.DOMElement.querySelector('.sparkline__svg');
    this.sparklines = this.data.map(d => new Polyline(this.sparklineSVG, d));
  }
}

export default Graph;
