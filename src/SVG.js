const SVG_NS = 'http://www.w3.org/2000/svg';
const svgElement = document.createElementNS(SVG_NS, 'svg');

class SVG {
  // TODO
  // constructor() {}
  createElement(descriptor) {
    return document.createElementNS(SVG_NS, descriptor);
  }
  createSVGPoint() {
    return svgElement.createSVGPoint();
  }
}

export default SVG();
