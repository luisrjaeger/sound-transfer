/** GLOBAL VARIABLES **/
var generateTimeout = 0;
/** GLOBAL VARIABLES **/

function initiateStream(parts) {
  if (parts.length > 0) {
    initialFrequency = handshakeFinish;
    finalFrequency = finishComm;
    // First sends a handshake
    generateFreq(handshakeStart, [], 0, function() {
      packageConfirmation(handshakeFinish, function() {
        srvPrint('handshake ok!', true);

        failureCount = 0;
        timer = new Date().getTime();

        sendNextPackStream(parts, 0);
      }, null, 500);
    });
  }
}

function sendNextPackStream(parts, idx) {
  generateFreq(parts[idx], [], 0, function() {
    packageConfirmation(ack, function() { //Success
      if (parts[idx + 1]) {
        failureCount = 0;
        srvPrint({ step: parts[idx + 1] });
        sendNextPackStream(parts, idx + 1);
      } else {
        generateFreq(finishComm, [], 0);
        srvPrint('End of file!', true);
        timer = undefined;
        setTimeout(function() {
          sendData();
        }, 1000);
      }
    }, function() { //Failure
      failureCount++;
      if (failureCount <= 10) {
        //Sends the same package again...
        sendNextPackStream(parts, idx);
      } else {
        srvPrint('Transmission error!', true);
      }
    }, 100);
  });
}

function receiveNextPackStream() {
  packageConfirmation(null, function(msg) {
    generateFreq(ack, [], 0, receiveNextPackStream);
  }, null, 2000);
}

function receiveData() {
  srvPrint('Start Receiving', true);
  finalMessage = '';
  lastMessage = undefined;
  packageConfirmation(handshakeStart, function() {
    generateFreq(handshakeFinish, [], 0, receiveNextPackStream);
  }, null, 2000);
}
