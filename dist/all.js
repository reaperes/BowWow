function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = [];
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      }
    );
  };

  request.onerror = function() {
    alert('BufferLoader: XHR error');
  };

  request.send();
};

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
};

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
function Sound(context) {
  var ctx = this;
  var loader = new BufferLoader(context, ['sounds/m4a1.mp3',
    'sounds/m1-garand.mp3'], onLoaded);

  function onLoaded(buffers) {
    ctx.buffers = buffers;
  };

  loader.load();
}

Sound.prototype.shootRound = function(type, rounds, interval, sound, random, random2) {
  sound = sound !== undefined ? sound : 0.5;

  if (typeof random == 'undefined') {
    random = 0;
  }
  var time = context.currentTime;
  // Make multiple sources using the same buffer and play in quick succession.
  for (var i = 0; i < rounds; i++) {
    var source = this.makeSource(this.buffers[type], sound);
    source.playbackRate.value = 1 + Math.random() * random2;
    source.start(time + i * interval + Math.random() * random);
  }
};

Sound.prototype.makeSource = function(buffer, sound) {
  var source = context.createBufferSource();
  var compressor = context.createDynamicsCompressor();
  var gain = context.createGain();
  gain.gain.value = sound;
  source.buffer = buffer;
  source.connect(gain);
  gain.connect(compressor);
  compressor.connect(context.destination);
  return source;
};
