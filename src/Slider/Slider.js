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

    this.scaleLeftSide = this.scaleLeftSide.bind(this);
    this.scaleRightSide = this.scaleRightSide.bind(this);
    this.moveSlider = this.moveSlider.bind(this);

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
      this.scaleLeftSide(difference);
    } else if (e.target === this.rightControl) {
      this.scaleRightSide(difference);
    } else if (e.target === this.slider) {
      this.moveSlider(difference);
    }
  }
  getPointerPosition(e) {
    return e.targetTouches ? e.targetTouches[0].clientX : e.clientX;
  }
  scaleLeftSide(difference) {
    if (this.rafInProgress) {
      return;
    }
    this.rafInProgress = true;
    requestAnimationFrame(() => {
      let left = this.left + difference;
      left = Math.min(left, this.width - MIN_SLIDER_WIDTH);
      left = Math.max(left, 0);
      this.left = left;

      if (this.left + MIN_SLIDER_WIDTH > this.right) {
        this.right = this.left + MIN_SLIDER_WIDTH;
      }

      this.handleChange();
      this.rafInProgress = false;
    });
  }
  scaleRightSide(difference) {
    if (this.rafInProgress) {
      return;
    }
    this.rafInProgress = true;
    requestAnimationFrame(() => {
      let right = this.right + difference;
      right = Math.min(right, this.width);
      right = Math.max(right, MIN_SLIDER_WIDTH);
      this.right = right;

      if (this.right < this.left + MIN_SLIDER_WIDTH) {
        this.left = this.right - MIN_SLIDER_WIDTH;
      }

      this.handleChange();
      this.rafInProgress = false;
    });
  }
  moveSlider(difference) {
    if (this.rafInProgress) {
      return;
    }
    this.rafInProgress = true;
    requestAnimationFrame(() => {
      if (this.right < this.width) {
        let left = this.left + difference;
        left = Math.min(left, this.width - MIN_SLIDER_WIDTH);
        left = Math.max(left, 0);
        this.left = left;
      }

      if (this.left > 0) {
        let right = this.right + difference;
        right = Math.min(right, this.width);
        right = Math.max(right, MIN_SLIDER_WIDTH);
        this.right = right;
      }

      this.handleChange();

      this.rafInProgress = false;
    });
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
    if (!this.changeCallback) return;

    this.changeCallback([this.left, this.right]);
  }
}

export default Slider;
