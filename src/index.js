import Graph from './Graph/Graph';
import './style.css';
import dataset from './chart_data.json';

const main = document.getElementById('main');
dataset.map((item, index) => new Graph(main, item, `Graph #${index + 1}`));

// Night mode toggle
const modeToggle = document.querySelector('.mode');
modeToggle.addEventListener('click', e => {
  e.preventDefault();
  document.body.classList.toggle('night');
});

// Loader
const loader = document.querySelector('.loader');
loader.classList.add('loader--hidden');
setTimeout(() => {
  loader.style.visibility = 'hidden';
}, 1000);
