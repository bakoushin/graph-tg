import './Checkbox.css';
import template from './Checkbox.html';

class Checkbox {
  constructor({ title, color = '#ccc', container, onChange = null }) {
    this.handleClick = this.handleClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    this.DOMElement = document.createElement('label');
    this.DOMElement.innerHTML = template;
    this.DOMElement.classList.add('checkbox');
    this.DOMElement.addEventListener('click', this.handleClick);

    const titleElement = this.DOMElement.querySelector('.checkbox__title');
    titleElement.textContent = title;

    const checkmarkElement = this.DOMElement.querySelector('.checkmark');
    checkmarkElement.style.borderColor = color;
    checkmarkElement.style.backgroundColor = color;

    const inputElement = this.DOMElement.querySelector('.checkbox__input');
    inputElement.addEventListener('change', this.hadleInputChange);

    this.onChangeCallback = onChange;

    this.rippleElement = this.DOMElement.querySelector('.checkbox__ripple');

    container.appendChild(this.DOMElement);
  }
  handleClick(e) {
    const pointer = e.targetTouches ? e.targetTouches[0] : e;
    const x = pointer.clientX;
    const y = pointer.clientY;
    this.rippleElement.style.transform = `translate(${x}px,${y}px) scale(1)`;
    setTimeout(() => {
      // this.rippleElement.style.transform = '';
    }, 650);
  }
  handleInputChange(e) {
    if (!this.onChangeCallback) {
      return;
    }
    onChangeCallback(e.target.checked);
  }
}

export default Checkbox;
