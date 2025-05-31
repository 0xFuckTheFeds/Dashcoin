export const gradeMaps = {
  default: {
    '2': 2,
    '1': 1,
    '0': 0,
    2: 2,
    1: 1,
    0: 0,
    Yes: 2,
    No: 1,
    Unknown: 0,
    '': 0,
  },
};

export function valueToScore(value, map = gradeMaps.default) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') {
    return value;
  }
  const key = value.toString().trim();
  if (map && Object.prototype.hasOwnProperty.call(map, key)) {
    return map[key];
  }
  if (Object.prototype.hasOwnProperty.call(gradeMaps.default, key)) {
    return gradeMaps.default[key];
  }
  const num = parseInt(key, 10);
  return isNaN(num) ? 0 : num;
}
