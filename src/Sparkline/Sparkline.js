import './Sparkline.css';
import { normalize } from '../utils';
import Polyline from '../Polyline/Polyline';
import { __spread } from 'tslib';

class Sparkline {
  constructor(svgContainer, data) {
    this._svg = svgContainer;
    this._data = {};
    this._polylines = {};

    data.forEach(([id, ...values]) => {
      const min = Math.min(...values);
      const max = Math.max(...values);
      this._data[id] = {
        data: values,
        visible: true,
        min,
        max
      };
    });

    Object.entries(this._data).forEach(([key, value]) => {
      const { data } = value;
      const points = this.calculatePoints(data);
      const polyline = new Polyline(this._svg, points);
      value.polyline = polyline;
    });

    window.addEventListener('resize', () => {
      this.onResize();
    });
  }
  calculatePoints(data) {
    const { width, height } = this._svg.getBoundingClientRect();
    const { min, max, spread } = this.bounds;

    const points = data.map((n, index) => {
      const y = ((n - min) / spread) * height;
      const x = index * (width / (data.length - 1));
      return [x, y];
    });

    return points;
  }
  onResize() {
    const polylines = Object.entries(this._data).map(([key, value]) => value);
    for (const { data, polyline, visible } of polylines) {
      if (!visible) continue;
      const points = this.calculatePoints(data);
      polyline.updatePoints(points);
    }
  }
  onDataChange(data) {
    // show or hide something
    // animate change something
  }
  get bounds() {
    const allMin = [];
    const allMax = [];
    Object.entries(this._data).forEach(([key, value]) => {
      const { min, max, visible } = value;
      if (visible) {
        allMin.push(min);
        allMax.push(max);
      }
    });
    const min = Math.min(...allMin);
    const max = Math.max(...allMax);
    const spread = max - min;
    return { min, max, spread };
  }
}

export default Sparkline;
