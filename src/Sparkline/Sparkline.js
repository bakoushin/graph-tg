import './Sparkline.css';
import { normalize } from '../utils';
import Polyline from '../Polyline/Polyline';

class Sparkline {
  constructor(svgContainer, data) {
    this._data = data;
    this._svg = svgContainer;

    this.recalculatePoints();

    this._polylines = Object.entries(this._points).map(
      ([_, column]) => new Polyline(this._svg, column)
    );
  }
  recalculatePoints() {
    const { width, height } = this._svg.getBoundingClientRect();
    const normData = normalize(this._data, height);
    const points = {};
    for (const column of normData) {
      const [id, ...values] = column;
      points[id] = values.map((value, index) => {
        const x = index * (width / (values.length - 1));
        const y = value;
        return [x, y];
      });
    }
    this._points = points;
  }
  onDataChange(data) {
    // show or hide something
    // animate change something
  }
}

export default Sparkline;
