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
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }

    this._points = points;
    // animate change in points
    const start = performance.now();
    const duration = 1000;

    const diff = this._points.map(([x, y], index) => {
      const diffX = x - this._polyline.points[index].x;
      const diffY = y - this._polyline.points[index].y;
      return [diffX, diffY];
    });

    const initialPoints = Array.from(this._polyline.points).map(({ x, y }) => {
      return { x, y };
    });

    const animate = now => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      diff.forEach(([x, y], index) => {
        this._polyline.points[index].x = initialPoints[index].x + x * progress;
        this._polyline.points[index].y = initialPoints[index].y + y * progress;
      });
      if (progress < 1) {
        this._rafId = requestAnimationFrame(animate);
      }
    };
    this._rafId = requestAnimationFrame(animate);
    // requestAnimationFrame(() => {
    //   this._points.forEach(([x, y], index) => {
    //     this._polyline.points[index].x = x;
    //     this._polyline.points[index].y = y;
    //   });
    // });
  }
  show() {
    //opacity +
    console.log('show');
    this._polyline.style.opacity = 1;
  }
  hide() {
    // opacity -
    console.log('hide');
    this._polyline.style.opacity = 0;
  }
  animateChange() {
    // renormalize visible paths and animate it
  }
}

export default Polyline;
