import Graph from './Graph/Graph';
import './style.css';

// TODO: get dataset from XHR
import dataset from './chart_data.json';

const main = document.getElementById('main');
// const charts = dataset.map(item => new Graph(main, item));
new Graph(main, dataset[0], 'Followers');

// TODO:
// - render graph with empty dataset

// Night mode toggle
const modeToggle = document.querySelector('.mode');
modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('night');
});

// Loader
const loader = document.querySelector('.loader');
loader.classList.add('loader--hidden');
setTimeout(() => {
  loader.style.visibility = 'hidden';
}, 1000);
