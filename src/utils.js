export function normalize(data, targetSpread) {
  let max = 0;
  let min = 0;
  for (const column of data) {
    for (const value of column) {
      if (!isNumber(value)) continue;
      if (value > max) max = value;
      if (value < min) min = value;
    }
  }
  const spread = max - min;

  const normData = data.map(column =>
    column.map(value => {
      if (!isNumber(value)) return value;
      return ((value - min) / spread) * targetSpread;
    })
  );

  return normData;
}

function isNumber(value) {
  return !Number.isNaN(Number(value));
}
