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

    this.width = this.slider.clientWidth;

    this.left = this.width * 0.66;
    this.right = this.width;

    this.isMoving = false;

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
  }
  handleInteractionStart(e) {
    e.preventDefault();

    this.isMoving = true;
    this.prevPointerPosition = this.getPointerPosition(e);

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

    this.isMoving = false;

    if (window.PointerEvent) {
      e.target.releasePointerCapture(e.pointerId);
    } else {
      document.removeEventListener('mousemove', this.handleInteractionMove);
      document.removeEventListener('mouseup', this.handleInteractionEnd);
    }
  }
  handleInteractionMove(e) {
    if (!this.isMoving) {
      return;
    }
    e.preventDefault();

    const pointerPosition = this.getPointerPosition(e);
    const difference = pointerPosition - this.prevPointerPosition;
    this.prevPointerPosition = pointerPosition;

    if (e.target === this.leftControl) {
      requestAnimationFrame(() => {
        this.setLeftPosition(difference);
        this.handleChange();
      });
    } else if (e.target === this.rightControl) {
      requestAnimationFrame(() => {
        this.setRightPosition(difference);
        this.handleChange();
      });
    } else if (e.target === this.slider) {
      requestAnimationFrame(() => {
        if (this.right < this.width) {
          this.setLeftPosition(difference);
        }
        if (this.left > 0) {
          this.setRightPosition(difference);
        }
        this.handleChange();
      });
    }
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
  get left() {
    return this._left;
  }
  set left(value) {
    this._left = value;
    this.leftSide.style.transform = `translateX(${value}px)`;
    this.frame.style.left = `${value}px`;
  }
  get right() {
    return this._right;
  }
  set right(value) {
    this._right = value;
    this.rightSide.style.transform = `translateX(${value}px)`;
    this.frame.style.right = `${this.width - value}px`;
  }
  onChange(callback) {
    this.changeCallback = callback;
  }
  handleChange() {
    if (!this.changeCallback) {
      return;
    }

    this.changeCallback([this.left, this.right]);
  }
}

export default Slider;
