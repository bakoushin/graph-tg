import './Sparkline.css';
import { normalize } from '../utils';
import Polyline from '../Polyline/Polyline';

class Sparkline {
  constructor(svgContainer, data) {
    this._data = data;
    this._svg = svgContainer;

    this.recalculatePoints();

    this._polylines = Object.entries(this._points).map(([id, column]) => ({
      id,
      polyline: new Polyline(this._svg, column)
    }));

    window.addEventListener('resize', () => {
      this.onResize();
    });
  }
  recalculatePoints() {
    const { width, height } = this._svg.getBoundingClientRect();
    const normData = normalize(this._data, height);
    const points = {};
    for (const [id, ...values] of normData) {
      points[id] = values.map((value, index) => {
        const x = index * (width / (values.length - 1));
        const y = value;
        return [x, y];
      });
    }
    this._points = points;
  }
  onResize() {
    this.recalculatePoints();
    for (const { id, polyline } of this._polylines) {
      polyline.update(this._points[id]);
    }
  }
  onDataChange(data) {
    // show or hide something
    // animate change something
  }
}

export default Sparkline;
