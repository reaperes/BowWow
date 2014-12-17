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
