import './Checkbox.css';
import template from './Checkbox.html';

class Checkbox {
  constructor({ index, title, color = '#ccc', container, onChange = null }) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = template;
    this.DOMElement = tempElement.children[0];

    this.index = index;

    const titleElement = this.DOMElement.querySelector('.checkbox__title');
    titleElement.textContent = title;

    const checkmarkElement = this.DOMElement.querySelector('.checkmark');
    checkmarkElement.style.borderColor = color;
    checkmarkElement.style.backgroundColor = color;

    this.handleClick = this.handleClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    const inputElement = this.DOMElement.querySelector('.checkbox__input');
    inputElement.addEventListener('change', this.handleInputChange);
    inputElement.addEventListener('click', this.handleClick);

    this.onChangeCallback = onChange;

    container.appendChild(this.DOMElement);
  }
  handleClick(e) {
    const { clientX, clientY } = e.targetTouches ? e.targetTouches[0] : e;
    const {
      left,
      top,
      width,
      height
    } = e.target.parentElement.getBoundingClientRect();

    const x = clientX - left - width / 2;
    const y = clientY - top - width / 2;

    const rippleSize = Math.max(width, height);

    const rippleElement = document.createElement('div');
    rippleElement.classList.add('checkbox__ripple');
    rippleElement.style.left = `${x}px`;
    rippleElement.style.top = `${y}px`;
    rippleElement.style.width = `${rippleSize}px`;
    rippleElement.style.height = `${rippleSize}px`;
    this.DOMElement.insertAdjacentElement('afterbegin', rippleElement);
    setTimeout(() => rippleElement.remove(), 650);
  }
  handleInputChange(e) {
    if (!this.onChangeCallback) {
      return;
    }
    this.onChangeCallback(this.index, e.target.checked);
  }
}

export default Checkbox;
