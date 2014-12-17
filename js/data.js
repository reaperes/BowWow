var Data = {};

Data.load = function (fileName, cb) {
  d3.csv(fileName)
    .row(function (row) {
      // check validation and insert data
      var pattern = /12-5-\d{2}:\d{1,2}:\d{1,2}:(\d+)/;
      var countNum = Number(pattern.exec(row.time)[1]);
      if (countNum <= 10)
        return {time: row.time, sound: Number(row.sound)};
    })
    .get(function (err, rows) {
      cb(rows);
    })
};

Data.findMinMax = function (arr) {
  var i, l;
  var minIdx, last;
  var stateUp = null;
  var result = [];

  if (arr === undefined || arr[0] === undefined) return ;

  minIdx = 0;
  last = arr[0].sound;
  for (i=1, l=arr.length; i<l; i++) {
    var cur = arr[i].sound;

    if (last < cur) {
      if (stateUp === false)
        minIdx = i-1;
      stateUp = true;
    } else if (last > cur) {
      if (stateUp) {
        getLoudness(arr[minIdx].time, arr[minIdx].sound, arr[i - 1].time, arr[i - 1].sound);
        result.push({
          startTime: arr[minIdx].time,
          endTime: arr[i - 1].time,
          volume: getLoudness(arr[minIdx].time, arr[minIdx].sound,
                              arr[i - 1].time, arr[i - 1].sound)
        });
      }
      stateUp = false;
    }
    last = cur;
  }
  if (stateUp) {
    getLoudness(arr[minIdx].time, arr[minIdx].sound, arr[i - 1].time, arr[i - 1].sound);
    result.push({
      startTime: arr[minIdx].time,
      endTime: arr[i - 1].time,
      volume: getLoudness(arr[minIdx].time, arr[minIdx].sound,
                          arr[i - 1].time, arr[i - 1].sound)
    });
  }

  function getLoudness(startTime, startSound, endTime, endSound) {
    var diffSound = endSound - startSound;
    var duration; // = endTime - startTime;

    var pattern = /12-5-(\d{2}):(\d{1,2}):(\d{1,2}):(\d+)/;

    var start = pattern.exec(startTime);
    var startH = start[1];
    var startM = start[2];
    var startS = start[3];
    var startC = start[4];  // count 0 ~ 10

    var end = pattern.exec(endTime);
    var endH = end[1];
    var endM = end[2];
    var endS = end[3];
    var endC = end[4];  // count 0 ~ 10

    duration = (endH - startH) * 36000 /* 60m * 60s * 10c */
             + (endM - startM) * 600 /* 60s * 10c */
             + (endS - startS) * 10
             + (endC - startC);

    return ((670 + 4 * diffSound) / 3250).toFixed(2);
  }
  return result;
};
