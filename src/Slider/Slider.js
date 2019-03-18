import './Slider.css';

const MIN_SLIDER_WIDTH = 48;

class Slider {
  constructor(DOMElement) {
    this.slider = DOMElement;
    this.leftSide = this.slider.querySelector('.slider__side--left');
    this.rightSide = this.slider.querySelector('.slider__side--right');

    this.sliderPosition = 0;
    this.sliderWidth = this.slider.clientWidth;
    this.isMoving = false;

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
    this.sliderWidth = this.slider.clientWidth;
    this.parentWidth = this.slider.parentElement.clientWidth;
    this.pointerPosition = this.getPointerX(e);

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
    if (!this.isMoving) return;

    e.preventDefault();

    const pointerX = Math.max(0, this.getPointerX(e));

    if (e.target === this.rightSide) {
      if (!this.rightSideRAFInProgress) {
        this.rightSideRAFInProgress = true;
        requestAnimationFrame(() => {
          this.sliderWidth += pointerX - this.pointerPosition;

          if (this.sliderWidth < MIN_SLIDER_WIDTH) {
            this.sliderWidth = MIN_SLIDER_WIDTH;
            this.sliderPosition += pointerX - this.pointerPosition;
            if (this.sliderPosition < 0) this.sliderPosition = 0;
          }
          if (this.sliderPosition + this.sliderWidth > this.parentWidth)
            this.sliderWidth = this.parentWidth - this.sliderPosition;

          this.pointerPosition = pointerX;

          this.slider.style.width = `${this.sliderWidth}px`;
          this.slider.style.transform = `translateX(${this.sliderPosition}px)`;
          this.rightSideRAFInProgress = false;

          this.handleChange();
        });
      }
    } else if (e.target === this.leftSide) {
      if (!this.leftSideRAFInProgress) {
        this.leftSideRAFInProgress = true;
        requestAnimationFrame(() => {
          // TODO: ERR slider grows up when leftSide is moved to the far left.
          this.sliderPosition += pointerX - this.pointerPosition;

          if (this.sliderPosition < 0) this.sliderPosition = 0;

          this.sliderWidth -= pointerX - this.pointerPosition;
          // console.log(pointerX - this.pointerPosition);

          if (this.sliderWidth < MIN_SLIDER_WIDTH)
            this.sliderWidth = MIN_SLIDER_WIDTH;

          if (this.sliderPosition + this.sliderWidth > this.parentWidth)
            this.sliderPosition = this.parentWidth - this.sliderWidth;

          // console.log(pointerX);
          this.pointerPosition = pointerX;

          this.slider.style.width = `${this.sliderWidth}px`;
          this.slider.style.transform = `translateX(${this.sliderPosition}px)`;
          this.leftSideRAFInProgress = false;

          this.handleChange();
        });
      }
    } else {
      if (!this.moveRAFInProgress) {
        this.moveRAFInProgress = true;
        requestAnimationFrame(() => {
          this.sliderPosition += pointerX - this.pointerPosition;
          this.pointerPosition = pointerX;

          if (this.sliderPosition < 0) this.sliderPosition = 0;
          if (this.sliderPosition + this.sliderWidth > this.parentWidth)
            this.sliderPosition = this.parentWidth - this.sliderWidth;

          this.slider.style.transform = `translateX(${this.sliderPosition}px)`;
          this.moveRAFInProgress = false;

          this.handleChange();
        });
      }
    }
  }
  getPointerX(e) {
    return e.targetTouches ? e.targetTouches[0].clientX : e.clientX;
  }
  onChange(callback) {
    this.changeCallback = callback;
  }
  handleChange() {
    if (!this.changeCallback) return;

    this.changeCallback(this.position);
  }
  get position() {
    return [this.sliderPosition, this.sliderPosition + this.sliderWidth];
  }
}

export default Slider;
