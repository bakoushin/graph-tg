class DataStore {
  constructor() {
    this._subscriptions = [];
    this._data = {};
  }
  subscribe(fn) {
    this._subscriptions.push(fn);
  }
  push(newData) {
    this._data = { ...this._data, ...newData };
    this._emitChange();
  }
  _emitChange() {
    for (const sub of subscriptions) {
      sub(this._data);
    }
  }
}

export default new DataStore();
