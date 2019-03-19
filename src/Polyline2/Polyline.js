import './Polyline.css';

class Polyline {
  constructor(
    svgContainer,
    data,
    min,
    max,
    { color = '#000', width = 1 } = {}
  ) {
    this.svg = svgContainer;

    this.polyline = document.createElementNS(this.svg.namespaceURI, 'polyline');
    this.polyline.classList.add('polyline');
    this.polyline.style.stroke = color;
    this.polyline.style.width = width;

    this.setData({ data, min, max });

    this.svg.appendChild(this.polyline);
  }
  setData({ data, min, max }) {
    this.data = [...data];
    this.min = min;
    this.max = max;
    this.points = this.mapDataToPoints(this.data, this.min, this.max);
    this.setPoints(this.points);
  }
  mapDataToPoints(data, min, max) {
    const { width, height } = this.svg.getBoundingClientRect();

    const spread = max - min;

    const points = data.map((n, index) => {
      const y = ((n - min) / spread) * height;
      const x = index * (width / (data.length - 1));
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
  /*
  updatePoints(points, duration = 1000) {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    this.points = [...points];
    // animate change in points
    const start = performance.now();

    const diff = this.points.map(([x, y], index) => {
      const diffX = x - this.polyline.points.getItem(index).x;
      const diffY = y - this.polyline.points.getItem(index).y;
      return [diffX, diffY];
    });

    const initialPoints = [];
    for (let i = 0; i < this.polyline.points.numberOfItems; i++) {
      const { x, y } = this.polyline.points.getItem(i);
      initialPoints.push({ x, y });
    }

    const animate = now => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      diff.forEach(([x, y], index) => {
        this.polyline.points.getItem(index).x =
          initialPoints[index].x + x * progress;
        this.polyline.points.getItem(index).y =
          initialPoints[index].y + y * progress;
      });
      if (progress < 1) {
        this.rafId = requestAnimationFrame(animate);
      }
    };
    this.rafId = requestAnimationFrame(animate);
    // requestAnimationFrame(() => {
    //   this.points.forEach(([x, y], index) => {
    //     this.polyline.points[index].x = x;
    //     this.polyline.points[index].y = y;
    //   });
    // });
  }
  show() {
    //opacity +
    console.log('show');
    this.polyline.style.opacity = 1;
    this.polyline.style.transition = 'opacity 1s linear';
  }
  hide() {
    // opacity -
    console.log('hide');
    this.polyline.style.opacity = 0;
    this.polyline.style.transition = 'opacity 0.3s linear';
  }
  */
}

export default Polyline;
