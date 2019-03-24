import './Slider.css';

const MIN_SLIDER_WIDTH = 48;

class Slider {
  constructor(DOMElement) {
    this.slider = DOMElement;
    this.leftSide = this.slider.querySelector('.slider__side--left');
    this.rightSide = this.slider.querySelector('.slider__side--right');
    this.leftControl = this.slider.querySelector('.slider__control--left');
    this.rightControl = this.slider.querySelector('.slider__control--right');
    this.frame = this.slider.querySelector('.slider__frame');
    this.frameLeft = this.slider.querySelector('.slider__frame-side--left');
    this.frameRight = this.slider.querySelector('.slider__frame-side--right');

    this.width = this.slider.clientWidth;

    this.left = this.width * 0.66;
    this.right = this.width;

    this.touches = {};

    this.setLeftPosition = this.setLeftPosition.bind(this);
    this.setRightPosition = this.setRightPosition.bind(this);

    this.handleInteractionStart = this.handleInteractionStart.bind(this);
    this.handleInteractionEnd = this.handleInteractionEnd.bind(this);
    this.handleInteractionMove = this.handleInteractionMove.bind(this);

    if (window.PointerEvent) {
      this.slider.addEventListener('pointerdown', this.handleInteractionStart);
      this.slider.addEventListener('pointermove', this.handleInteractionMove);
      this.slider.addEventListener('pointerup', this.handleInteractionEnd);
      this.slider.addEventListener('pointercancel', this.handleInteractionEnd);
    } else {
      this.slider.addEventListener('touchstart', this.handleInteractionStart);
      this.slider.addEventListener('touchmove', this.handleInteractionMove);
      this.slider.addEventListener('touchup', this.handleInteractionEnd);
      this.slider.addEventListener('touchcancel', this.handleInteractionEnd);

      this.slider.addEventListener('mousedown', this.handleInteractionStart);
    }

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }
  handleInteractionStart(e) {
    e.preventDefault();

    const pointerId = this.getPointerId(e);
    this.touches[pointerId] = {
      target: e.target,
      isMoving: true,
      prevPointerPosition: this.getPointerPosition(e)
    };

    this.width = this.slider.clientWidth;

    if (window.PointerEvent) {
      e.target.setPointerCapture(e.pointerId);
    } else {
      document.addEventListener('mousemove', this.handleInteractionMove);
      document.addEventListener('mouseup', this.handleInteractionEnd);
    }
  }
  handleInteractionEnd(e) {
    e.preventDefault();

    const pointerId = this.getPointerId(e);
    delete this.touches[pointerId];

    if (window.PointerEvent) {
      e.target.releasePointerCapture(e.pointerId);
    } else {
      document.removeEventListener('mousemove', this.handleInteractionMove);
      document.removeEventListener('mouseup', this.handleInteractionEnd);
    }
  }
  handleInteractionMove(e) {
    const pointerId = this.getPointerId(e);

    if (!this.touches[pointerId]) {
      return;
    }

    e.preventDefault();

    const currentTouch = this.touches[pointerId];
    const pointerPosition = this.getPointerPosition(e);
    const difference = pointerPosition - currentTouch.prevPointerPosition;
    currentTouch.prevPointerPosition = pointerPosition;

    if (currentTouch.target === this.leftControl) {
      requestAnimationFrame(() => {
        this.setLeftPosition(difference);
        this.handleChange();
      });
    } else if (currentTouch.target === this.rightControl) {
      requestAnimationFrame(() => {
        this.setRightPosition(difference);
        this.handleChange();
      });
    } else if (currentTouch.target === this.slider) {
      requestAnimationFrame(() => {
        const movingLeft = difference < 0;
        const movingRight = difference > 0;
        const width = this.right - this.left;
        if (movingRight) {
          this.setRightPosition(difference);
          this.left = this.right - width;
        }
        if (movingLeft) {
          this.setLeftPosition(difference);
          this.right = this.left + width;
        }
        this.handleChange();
      });
    }
  }
  handleResize() {
    this.width = this.slider.clientWidth;
    requestAnimationFrame(() => {
      this.left = this.width * this.start;
      this.right = this.width * this.end;
    });
  }
  getPointerId(e) {
    return e.targetTouches ? e.targetTouches[0].identifier : e.pointerId;
  }
  getPointerPosition(e) {
    return e.targetTouches ? e.targetTouches[0].clientX : e.clientX;
  }
  setLeftPosition(difference) {
    let left = this.left + difference;
    left = Math.min(left, this.right - MIN_SLIDER_WIDTH);
    left = Math.max(left, 0);
    this.left = left;
  }
  setRightPosition(difference) {
    let right = this.right + difference;
    right = Math.min(right, this.width);
    right = Math.max(right, this.left + MIN_SLIDER_WIDTH);
    this.right = right;
  }
  setFrameScale() {
    const ratio = (this.right - this.left) / this.width;
    this.frame.style.transform = `translateX(${this.left}px) scaleX(${ratio})`;
  }
  get left() {
    return this._left;
  }
  set left(value) {
    this._left = value;
    this.start = value / this.width;
    this.leftSide.style.transform = `translateX(${value}px)`;
    this.frameLeft.style.transform = `translateX(${value}px)`;
    this.setFrameScale();
  }
  get right() {
    return this._right;
  }
  set right(value) {
    this._right = value;
    this.end = value / this.width;
    this.rightSide.style.transform = `translateX(${value}px)`;
    this.frameRight.style.transform = `translateX(${value}px)`;
    this.setFrameScale();
  }
  setRange(start, end) {
    this.start = start;
    this.end = end;

    this.left = this.width * start;
    this.right = this.width * end;
    this.handleChange();
  }
  onChange(callback) {
    this.changeCallback = callback;
  }
  handleChange() {
    if (!this.changeCallback) {
      return;
    }

    this.changeCallback([this.start, this.end]);
  }
}

export default Slider;
