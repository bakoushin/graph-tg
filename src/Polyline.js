//import svg from './SVG';

class Polyline {
  constructor(container, data) {
    this._el = container;
    this._data = data;

    const { width } = this._el.getBoundingClientRect();

    this._polyline = svg.createElement('polyline');
    // TODO: set only stroke, rest is CSS
    this._polyline.style = 'fill:none;stroke:#666;stroke-width:1;';

    data.forEach((value, index) => {
      const point = svg.createSVGPoint();
      point.x = index * (width / (data.length - 1));
      point.y = value;
      this._polyline.points.appendItem(point);
    });

    this._el.appendChild(this._polyline);
  }
  update(data) {
    this._data = data;
    // animate change in data
  }
  show() {
    //opacity +
  }
  hide() {
    // opacity -
  }
  animateChange() {
    // renormalize visible paths and animate it
  }
}

export default Polyline;
