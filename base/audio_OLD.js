/** GLOBAL VARIABLES **/
function FrequenciesSense(sensibility) {

  list = sensibility || {};

  this.setSenseAt = function(index, power) {
    list[indexToFreq(index)] = Math.round(power);
  };

  this.getSenseAt = function(index) {
    return list[indexToFreq(index)] || -999;
  };

  this.getSensibility = function() {
    return list;
  };

}

var ctx = new window.AudioContext(),
    ctx2 = new window.AudioContext(),
    ctx3 = new window.AudioContext(),
    ctx4 = new window.AudioContext(),
    ctx5 = new window.AudioContext(),
    text = 'Testing the data transmission through the sound for the conclusion project of Luís Ricardo Jaeger...',
    textFrequency, textCount = 0, analyser, freqs, loopIterator, allFrequencies = [], listCount = 0,
    initialFrequency = 17500, finalFrequency = 22100, loopInterval = 1000/60,
    messageClock = 0.2 /*08*/, failureCount, lastMessage, dataLoad,
    frequenciesSensibility, freqAck = {}, freqObj = {},
    handshakeStart = [17500], handshakeFinish = [17700],
    ack = [17800], finishComm = [17900], timer, idxCtx;


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
    audio: { optional: [{ echoCancellation: true }] },
    video: false
  };

  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  navigator.getUserMedia(constraints, startMicrophone, microphoneError);
}

function microphoneError(error) {
  if (!isMobile) {
    console.error('Microphone error!', error);
  } else {
    srvPrint({ 'Microphone error!': error });
  }
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

  setTimeout(function() {
    sampleAdjust();
  }, 500);
}

function sampleAdjust() {
  initialFrequency = 17500;
  finalFrequency = 22100;
  for (var i = initialFrequency; i <= finalFrequency; i += 100) {
    allFrequencies.push(i);
  }

  srvPrint('Adjusting');
  adjustSensibility();
}
/*
function adjustTranmistter() {
  srvPrint('Calling Generator');
  generateAllFrequencies(true);
}

function adjustReceiver() {
  srvPrint('Calling Adjust');
  adjustSensibility(true);
}

function generateAllFrequencies(callNextFunction) {
  var iteration = (finalFrequency - initialFrequency) / 100;

  if (getIterator() > iteration * 2 + 1) {
    setIterator(undefined);
    if (callNextFunction) {
      srvPrint('Calling Adjust');
      adjustSensibility();
    }
    return;
  }

  generateFreq([allFrequencies[getIterator() % (iteration + 1)]], [], 0);
  increaseIterator();

  setTimeout(function() {
    generateAllFrequencies(callNextFunction);
  }, 100);
}
*/
function adjustSensibility() {
   frequenciesSensibility = new FrequenciesSense();
   adjustSensibilityLoop();
}

function adjustSensibilityLoop() {
  generateSensibilityList();

  if (getIterator() > 600) {
    setIterator(undefined);
    srvPrint({ 'FrequenciesSensibility': frequenciesSensibility.getSensibility(), 'Sensibility': 'OK!'});
    return;
  }

  increaseIterator();

  setTimeout(function() {
    adjustSensibilityLoop();
  }, loopInterval);
}

function generateSpecificFrequency() {
  var value = getVal('txFrequency').split(',');
  generateFreq(value, [], 0);
}

function generateFreq(frequencies, oscillators, idx, callback) {
  var context = getContext(), osc = context.createOscillator(),
      gainNode = context.createGain();

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
      oscillators[i].stop(context.currentTime + messageClock);
    }

    if (callback) {
      setTimeout(function() {
        callback();
      }, generateTimeout);
    }
  }
}

function packageConfirmation(expectedConfirmation, successFunc, failureFunc, waitingTime) {
  var resultFrequecies = findFrequencies(expectedConfirmation), success = '';

  if (resultFrequecies.length > 0) {
    srvPrint({ resultFrequecies: resultFrequecies});
    if (expectedConfirmation instanceof Array) {
      srvPrint('Array');
      if (equalFrequencies(expectedConfirmation,resultFrequecies)) {
        srvPrint('É');
        setIterator(undefined);
        successFunc();
        return;
      }
    } else {
      srvPrint('else');
      if (equalFrequencies(finishComm,resultFrequecies)) {
        setIterator(undefined);
        textCount = 0;
        console.info('End Transmission!');
        finalMessage = rc4(finalMessage);
        if (finalMessage != text) {
          success = 'FALHA!';
        }
        outputResult(++listCount, finalMessage, new Date().getTime() - timer, success);
        timer = undefined;
        receiveData();
        return;
      }

      srvPrint('antes process');
      var msgPackage = processMessageData(resultFrequecies);

      srvPrint({ teste: resultFrequecie });

      srvPrint('antes if');
      if (msgPackage.success && msgPackage.data !== lastMessage) {
        if (!timer) {
          timer = new Date().getTime();
        }
        lastMessage = msgPackage.data;
        setIterator(undefined);
        textCount++;
        finalMessage += msgPackage.data;
        successFunc(/*msgPackage.data*/);
        return;
      }
    }
  }

  if (getIterator() > waitingTime) {
    setIterator(undefined);
    console.info('No package confirmation!');
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
      frequencies = [], releaseData = true;

  //Retrieve frequencies from mic and set on freqs
  analyser.getFloatFrequencyData(freqs);

  for (var index = startIndex; index <= endIndex; index++) {
    if (validateDbSensibility(index)) {
      if ((freqObj[indexToFreq(index)] || -999) < freqs[index]) {
        freqObj[indexToFreq(index)] = freqs[index];
      }
      releaseData = false;
    }
  }

  if (releaseData) {
    for (var prop in freqObj) {
      frequencies.push(parseInt(prop));
    }
    freqObj = {};
  }

  return frequencies;
}

function generateSensibilityList() {
  var startIndex = freqToIndex(initialFrequency),
      endIndex = freqToIndex(finalFrequency),
      modifier = 10, frequencies = [];

  analyser.getFloatFrequencyData(freqs);

  for (var index = startIndex; index < endIndex; index++) {
    if (rightDbFrequency(index, modifier)) {
      frequenciesSensibility.setSenseAt(index, freqs[index] + modifier);
    }
  }
}

function rightDbFrequency(index, modifier) {
  if (freqs[index] > (frequenciesSensibility.getSenseAt(index) - modifier)) {
    return true;
  }
  return false;
}

function validateDbSensibility(index) {
  var dbSense = frequenciesSensibility.getSenseAt(index),
      db = freqs[index];

  if (db > dbSense) {
    if (((dbSense * -1) + db) > 20) {
        frequenciesSensibility.setSenseAt(index, dbSense + 1);
    }

    return true;
  }

  return false;
}

function indexToFreq(index) {
  var nyquist = ctx5.sampleRate/2;
  var parcial = nyquist/freqs.length * index;

  return Math.round(parcial / 100) * 100;
}

function freqToIndex(frequency) {
  var nyquist = ctx5.sampleRate/2;
  return Math.round(frequency/nyquist * freqs.length);
}

window.onload = function(){
  detectDevice();
  requestMicrophone();
};
