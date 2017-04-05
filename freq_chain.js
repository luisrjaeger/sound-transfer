var osc, osc2, oscillator, lfo;
window.onclick = start;

function start() {

  status_.textContent = 'stop';

  var AudioContext = window.AudioContext || window.webkitAudioContext;

  var audioCtx = new AudioContext();

  // create an normal oscillator to make sound
  oscillator = audioCtx.createOscillator();

  osc = audioCtx.createOscillator();
  osc2 = audioCtx.createOscillator();
  lfo = audioCtx.createOscillator();


  lfo.frequency.value = 18000; // 2Hz: two oscillations par second
  osc.frequency.value = 18500; // 2Hz: two oscillations par second
  osc2.frequency.value = 20000; // 2Hz: two oscillations par second

  // create a gain whose gain AudioParam will be controlled by the LFO
  var gain = audioCtx.createGain();
  var gain2 = audioCtx.createGain();
  var gain3 = audioCtx.createGain();

  osc2.connect(gain3);
  osc.connect(gain3);

  osc.connect(gain2);
  lfo.connect(gain2);

  lfo.connect(gain);
  oscillator.connect(gain);

  // connect the gain to the destination so we hear sound
  gain.connect(audioCtx.destination);
  gain2.connect(audioCtx.destination);
  gain3.connect(audioCtx.destination);

  // start the oscillator that will produce audio
  oscillator.frequency.value = 19000

  oscillator.start();
  lfo.start();
  osc.start();
  osc2.start();

  window.onclick = stop;

}

function stop() {

  status_.textContent = 'start';
  oscillator.stop();
  lfo.stop();
  osc.stop();
  osc2.stop();

  oscillator = undefined;
  osc = undefined;
  lfo = undefined;

  window.onclick = start

}
