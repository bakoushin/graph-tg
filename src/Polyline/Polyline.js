import './Polyline.css';

class Polyline {
  constructor(svgContainer, points, color = '#000') {
    this.svg = svgContainer;
    this.points = [...points];

    this.polyline = document.createElementNS(this.svg.namespaceURI, 'polyline');
    this.polyline.classList.add('polyline');
    this.polyline.style.stroke = color;

    this.setPoints(this.points);
    this.svg.appendChild(this.polyline);
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

    this.points = [...points];
    // animate change in points
    const start = performance.now();
    const duration = 1000;

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
  }
  hide() {
    // opacity -
    console.log('hide');
    this.polyline.style.opacity = 0;
  }
  animateChange() {
    // renormalize visible paths and animate it
  }
  addPoints(points) {
    [...points].reverse().forEach(([x, y]) => {
      this.points.unshift([x, y]);

      const point = this.svg.createSVGPoint();
      point.x = 0;
      point.y = y;
      this.polyline.points.insertItemBefore(point, 0);
    });
  }
}

export default Polyline;
