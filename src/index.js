import Graph from './Graph/Graph';
import './style.css';

// TODO: get dataset from XHR
import dataset from '../spec/chart_data.json';

const main = document.getElementById('main');
// const charts = dataset.map(item => new Graph(main, item));
new Graph(main, dataset[0]);

// TODO:
// - render graph with empty dataset
