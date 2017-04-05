/** GLOBAL VARIABLES **/
function FrequenciesSense(sensibility) {

  var list = sensibility || {};

  this.setSenseAt = function(index, power) {
    list[indexToFreq(index)] = Math.round(power);
  };

  this.getSenseAt = function(index) {
    return list[indexToFreq(index)] || -999;
  };

  this.getSensibility = function() {
    return jQuery.extend(true, {}, list);
  };

}

var ctx = new window.AudioContext(),
    ctx2 = new window.AudioContext(),
    ctx3 = new window.AudioContext(),
    ctx4 = new window.AudioContext(),
    ctx5 = new window.AudioContext(),
    text = 'Testing the data transmission through the sound for the conclusion project of Luis Ricardo Jaeger...',
    textFrequency, textCount = 0, analyser, freqs, loopIterator, listCount = 0, oscillators,
    initialFrequency = 17500, finalFrequency = 22100, loopInterval = 1000/60,
    messageClock = 0.26, failureCount, lastMessage, /*freqsDebug,*/
    sense, freqObj = {}, freqDebug = {}, freqDebug2 = {}, runningAnalyse, modifier = -5,
    handshakeStart = [17500], handshakeFinish = [17700],
    ack = [17800], finishComm = [17600], timer, idxCtx;


function increaseIterator() {
  if (loopIterator !== undefined) {
    setIterator((loopIterator || 0) + 1);
    return;
  }

  setIterator(0);
}

function setIterator(value) {
  loopIterator = value;
}

function getIterator() {
  return loopIterator || 0;
}
/*
function getContext() {
  return ctx;
}
*/
function getContext() {
  if (idxCtx < 10) {
    idxCtx++;
    return ctx;
  } else if (idxCtx < 20) {
    idxCtx++;
    return ctx2;
  } else if (idxCtx < 31) {
    idxCtx++;
    return ctx3;
  } else if (idxCtx < 41) {
    idxCtx++;
    return ctx4;
  }

  idxCtx = 0;
  return ctx4;
}

/** GLOBAL VARIABLES **/

function requestMicrophone() {
  var constraints = {
    "audio": {
      "mandatory": {
        "googEchoCancellation": "false",
        "googAutoGainControl": "false",
        "googNoiseSuppression": "false",
        "googHighpassFilter": "false"
      },
      "optional": []
    }
  };

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  navigator.getUserMedia(constraints, startMicrophone, microphoneError);
}

function microphoneError(error) {
  srvPrint({ 'Microphone error!': error }, true);
}

function startMicrophone(stream) {
  var input = ctx5.createMediaStreamSource(stream);

  analyser = ctx5.createAnalyser();
  input.connect(analyser);

  // Create the frequency array.
  analyser.fftSize = 4096;
  analyser.smoothingTimeConstant = false;
  freqs = new Float32Array(analyser.frequencyBinCount);

  textFrequency = textToFrequency(text);

  //if (isMobile) {
    setTimeout(function() {
      sampleAdjust();
    }, 500);
  //}
}

function sampleAdjust() {
  initialFrequency = 17500;
  finalFrequency = 22100;

  if (isMobile) {
    modifier = -15;
  }

  adjustSensibility();
}

function adjustSensibility() {
  srvPrint('Adjusting', true);
  sense = new FrequenciesSense();
  adjustSensibilityLoop();
}

function adjustSensibilityLoop() {
  generateSensibilityList();

  if (getIterator() > 1200) {
    setIterator(undefined);
    srvPrint({ sense: sense.getSensibility(), modifier: modifier, Sensibility: 'OK!' }, true);
    return;
  }

  increaseIterator();

  setTimeout(function() {
    adjustSensibilityLoop();
  }, loopInterval);
}

function generateSensibilityList() {
  var startIndex = freqToIndex(initialFrequency),
      endIndex = freqToIndex(finalFrequency),
      frequencies = [];

  analyser.getFloatFrequencyData(freqs);

  for (var index = startIndex; index < endIndex; index++) {
    if (rightDbFrequency(index, modifier)) {
      sense.setSenseAt(index, freqs[index] + modifier);
    }
  }
}

function rightDbFrequency(index, modifier) {
  if (freqs[index] > (sense.getSenseAt(index) - modifier)) {
    return true;
  }
  return false;
}

function callAllFrequencies() {
  var iteration = (finalFrequency - initialFrequency) / 100;
  generateAllFrequencies(iteration);
}

function generateAllFrequencies(iteration) {
  if (getIterator() > iteration * 2 + 1) {
    setIterator(undefined);
    return;
  }

  var frequency = (getIterator() % (iteration + 1)) * 100 + initialFrequency;

  generateFreq([
    frequency,
    frequency + 300,
    frequency + 600,
    frequency + 900,
    frequency + 1200,
    frequency + 1500,
    frequency + 1800,
    frequency + 2100,
    frequency + 2400,
    frequency + 2700,
    frequency + 3000
  ], [], 0);
  increaseIterator();

  setTimeout(function() {
    generateAllFrequencies(iteration);
  }, generateTimeout);
}

function toggleAnalyseFrequency() {
  runningAnalyse = !runningAnalyse;

  if (runningAnalyse) {
    srvPrint('Start analyses!', true);
    debugEnabled = true;
    setVal('toggleAnalyses', 'Stop Analyses');
    analyseFrequency();
  } else {
    debugEnabled = false;
    setVal('toggleAnalyses', 'Start Analyses');
  }
}

function analyseFrequency() {
  var frequencies = findFrequencies();

  setTimeout(function() {
    if (!runningAnalyse) {
      srvPrint('Analyse finished!', true);
      return;
    }
    analyseFrequency();
  }, loopInterval);
}

function generateSpecificFrequency() {
  var value = getVal('txFrequency').split(',');
  generateFreq(value, [], 0);
}

function createOscillators() {
  var allFrequencies = [];

  for (var i = initialFrequency; i <= finalFrequency; i += 100) {

  }
}

function generateFreq(frequencies, oscillators, idx, callback) {
  var context = getContext(), osc = context.createOscillator(),
      gainNode = context.createGain(), currentTime = context.currentTime;

  gainNode.gain.value = 0.1;
  osc.frequency.value = frequencies[idx];
  osc.type = "sine";
  osc.connect(gainNode);
  gainNode.connect(context.destination);

  osc.start();

  oscillators.push(osc);

  if (frequencies[idx + 1]) {
    generateFreq(frequencies, oscillators, idx + 1, callback);
  } else {
    for (var i = 0; i < oscillators.length; i++) {
      /*if (oscillators[i].frequency.value >= 17500 && oscillators[i].frequency.value <= 18000) {
          oscillators[i].stop(context.currentTime + 0.08);
      } else {*/
        oscillators[i].stop(currentTime + messageClock);
      //}
    }

    if (callback) {
      setTimeout(function() {
        callback();
      }, generateTimeout);
    }
  }
}

function packageConfirmation(expectedConfirmation, successFunc, failureFunc, waitingTime) {
  var resultFrequencies = findFrequencies(expectedConfirmation);

  if (resultFrequencies.length > 0) {
    srvPrint({ resultFrequencies: resultFrequencies});
    if (expectedConfirmation instanceof Array) {
      if (equalFrequencies(expectedConfirmation,resultFrequencies)) {
        setIterator(undefined);
        successFunc();
        return;
      }
    } else {
      if (equalFrequencies(finishComm,resultFrequencies)) {
        setIterator(undefined);
        textCount = 0;
        srvPrint('End Transmission!');
        outputResult(++listCount, finalMessage, new Date().getTime() - timer);
        timer = undefined;
        receiveData();
        return;
      }

      var msgPackage = processMessageData(resultFrequencies);

      if (msgPackage.success && msgPackage.data !== lastMessage) {
        if (!timer) {
          timer = new Date().getTime();
        }
        lastMessage = msgPackage.data;
        setIterator(undefined);
        textCount++;
        finalMessage += msgPackage.data;
        successFunc();
        return;
      }/* else { // TODO: REMOVE
        srvPrint({ ERRO: freqDebug2 });
        setIterator(waitingTime + 1);
      }*/
    }
  }

  if (getIterator() > waitingTime) {
    setIterator(undefined);
    srvPrint('No package confirmation!');
    if (failureFunc) {
      failureFunc();
    }
    return;
  }

  increaseIterator();

  setTimeout(function() {
    packageConfirmation(expectedConfirmation, successFunc, failureFunc, waitingTime);
  }, loopInterval);
}

function findFrequencies(expected) {
  if (expected) {
    return getFrequencies(expected[0], expected[expected.length - 1]);
  }

  return getFrequencies();
}

function getFrequencies(iniFreq, finFreq) {
  var startIndex = freqToIndex(iniFreq || initialFrequency),
      endIndex = freqToIndex(finFreq || finalFrequency),
      frequencies = [], releaseData = true,
      db, nextDb, previousDb, placeLog = function(db, previousDb, nextDb, index) {
        return {
          db: db,
          data: previousDb + ' ||||| ' + nextDb + ' ||||| ' + index,
          sense: sense.getSenseAt(index)
        };
      };

  //Retrieve frequencies from mic and set on freqs
  analyser.getFloatFrequencyData(freqs);

  for (var index = startIndex; index <= endIndex; index++) {
    if (!validPrecision(index)) {
      continue;
    }

    var tempFreq = indexToFreq(index);
    //To define whether this index worth to be evaluate, compare with next and previous
    //The index has to be the peak
    db = freqs[index];
    nextDb = freqs[index + 1];
    previousDb = freqs[index - 1];

    if (freqDebug[tempFreq]) {
      if (!freqDebug[tempFreq].ACCEPT && db > freqDebug[tempFreq].db) {
        freqDebug[tempFreq] = placeLog(db, previousDb, nextDb, index);
      }
    } else {
      freqDebug[tempFreq] = placeLog(db, previousDb, nextDb, index);
    }

    if (db >= nextDb && db >= previousDb && validateSensibility(index, db)) {
      freqObj[tempFreq] = db;
      releaseData = false;

      freqDebug[tempFreq] = placeLog(db, previousDb, nextDb, index);
      freqDebug[tempFreq].ACCEPT = db;
    }
  }

  if (releaseData) {
    for (var prop in freqObj) {
      frequencies.push(parseInt(prop));
    }

    if (frequencies.length > 0) {
      /*freqsDebug = freqs.slice();*/

      freqDebug2 = freqDebug;
      if (runningAnalyse) {
        srvPrint(freqDebug);
        srvPrint({ result: frequencies.toString() });
      }
    }

    freqObj = {};
    freqDebug = {};
  }

  return frequencies;
}

function validateSensibility(index, db) {
  var dbSense = sense.getSenseAt(index);

  if (db > dbSense) {
    if (((dbSense * -1) + db) > 10) {
      sense.setSenseAt(index, dbSense + 2);
    }

    return true;
  }

  return false;
}

function validPrecision(index) {
  var realFreq = indexToRealFreq(index),
      freq = indexToFreq(index),
      distance = 25;

  return realFreq >= (freq - distance) && (realFreq <= freq + distance);
}

function indexToRawFreq(index) {
  var nyquist = ctx5.sampleRate/2;
  return (nyquist/freqs.length) * index;
}

function indexToFreq(index) {
  return Math.round(indexToRawFreq(index) / 100) * 100;
}

function indexToRealFreq(index) {
  return Math.round(indexToRawFreq(index));
}

function freqToIndex(frequency) {
  var nyquist = ctx5.sampleRate/2;
  return Math.round(frequency/nyquist * freqs.length);
}

function initAudio() {
  detectDevice();

  if (entity != 'transmitter') {
    requestMicrophone();
  }
}

window.addEventListener('load', initAudio);
