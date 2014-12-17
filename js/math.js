/**
 * Return row elements value average.
 * @param arr {Array}
 */
Math.average = function (arr) {
  var i, l, sum = 0;
  for (i=0, l=arr.length; i<l; i++)
    sum += arr[i].sound;

  return parseInt(sum / l);
};