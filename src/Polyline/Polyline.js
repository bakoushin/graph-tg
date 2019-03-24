import './Polyline.css';

class Polyline {
  constructor({ svgContainer, values, spread, color = '#000', width = 1 }) {
    this.svg = svgContainer;

    this.polyline = document.createElementNS(this.svg.namespaceURI, 'polyline');
    this.polyline.classList.add('polyline');
    this.polyline.style.stroke = color;
    this.polyline.style.strokeWidth = width;

    if (values && spread) {
      this.setData({ values, spread });
    }

    this.svg.appendChild(this.polyline);
  }
  setData({ values, spread }) {
    this.values = [...values];
    this.spread = spread;
    this.points = this.mapValuesToPoints(this.values, this.spread);
    this.setPoints(this.points);
  }
  setSpread(spread) {
    const newPoints = this.mapValuesToPoints(this.values, spread);
    this.updatePoints(newPoints);
  }
  mapValuesToPoints(values, spread) {
    const { width, height } = this.svg.getBoundingClientRect();
    const points = values.map((n, index) => {
      const y = (n / spread) * height;
      const x = index * (width / (values.length - 1));
      return [x, y];
    });
    return points;
  }
  setPoints(points) {
    this.points = [...points];
    this.polyline.points.clear();
    for (const [x, y] of points) {
      const point = this.svg.createSVGPoint();
      point.x = x;
      point.y = y;
      this.polyline.points.appendItem(point);
    }
  }
  updatePoints(points) {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    this.points = points;

    const prevPoints = [];
    for (let i = 0; i < this.polyline.points.numberOfItems; i++) {
      const { x, y } = this.polyline.points.getItem(i);
      prevPoints.push([x, y]);
    }

    const difference = this.points.map(([x, y], index) => {
      const [prevX, prevY] = prevPoints[index];
      return [x - prevX, y - prevY];
    });

    const start = performance.now();
    const duration = 150;
    const animate = now => {
      const progress = Math.min(1, (now - start) / duration);
      difference.forEach(([x, y], index) => {
        const [prevX, prevY] = prevPoints[index];
        const point = this.polyline.points.getItem(index);
        point.x = prevX + x * progress;
        point.y = prevY + y * progress;
      });
      if (progress < 1) {
        this.rafId = requestAnimationFrame(animate);
      }
    };
    this.rafId = requestAnimationFrame(animate);
  }
  show() {
    this.polyline.style.opacity = 1;
    this.polyline.style.transition = 'opacity 1s linear';
  }
  hide() {
    this.polyline.style.opacity = 0;
    this.polyline.style.transition = 'opacity 0.3s linear';
  }
}

export default Polyline;
