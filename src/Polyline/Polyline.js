import './Polyline.css';

class Polyline {
  constructor(svgContainer, points, color = null) {
    this._svg = svgContainer;
    this._points = points;

    this._polyline = document.createElementNS(
      this._svg.namespaceURI,
      'polyline'
    );

    this._polyline.classList.add('polyline');

    if (color) {
      this._polyline.style.stroke = color;
    }

    this._points.forEach(([x, y]) => {
      const point = this._svg.createSVGPoint();
      point.x = x;
      point.y = y;
      this._polyline.points.appendItem(point);
    });

    this._svg.appendChild(this._polyline);
  }
  update(points) {
    this._points = points;
    // animate change in points
    requestAnimationFrame(() => {
      this._points.forEach(([x, y], index) => {
        this._polyline.points[index].x = x;
        this._polyline.points[index].y = y;
      });
    });
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
