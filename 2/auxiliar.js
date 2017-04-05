/** GLOBAL VARIABLES **/
var generateTimeout = 460, stepByStepCounter = -1;
/** GLOBAL VARIABLES **/

function initiateStream(parts) {
  if (parts.length > 0) {
    parts.unshift(handshakeStart);
    sendNextPackStream(parts, 0);
  }
}

function stepByStepStream(parts) {
  if (parts.length > 0) {
    if (stepByStepCounter > -1) {
      if (parts[stepByStepCounter]) {
        srvPrint({ step: parts[stepByStepCounter] });
        generateFreq(parts[stepByStepCounter], [], 0);
      } else {
        srvPrint({ finishComm: finishComm });
        generateFreq(finishComm, [], 0);
        stepByStepCounter = -1;
      }
    } else {
      srvPrint({ handshakeStart: handshakeStart });
      generateFreq(handshakeStart, [], 0);
    }
    stepByStepCounter++;
  }
}

function sendNextPackStream(parts, idx) {
  generateFreq(parts[idx], [], 0, function() {
    if (parts[idx + 1]) {
      srvPrint({ step: parts[idx + 1] });
      sendNextPackStream(parts, idx + 1);
    } else {
      generateFreq(finishComm, [], 0);
      srvPrint('End of file!', true);
      setTimeout(function() {
        sendData();
      }, 1000);
    }
  });
}

function receiveData() {
  srvPrint('Start Receiving', true);
  finalMessage = '';
  lastMessage = undefined;
  packageConfirmation(handshakeStart, function() {
    srvPrint('handshake ok!', true);
    receiveNextPackStream();
  }, null, 2000);
}

function receiveNextPackStream() {
  packageConfirmation(null, function(msg) {
    receiveNextPackStream();
  }, null, 2000);
}
