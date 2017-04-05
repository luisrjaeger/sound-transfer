/** GLOBAL VARIABLES **/
var startDataFreq = 18100, rc4Key = 'easybusy',
    isMobile = false, huffmanTreeString = '[[[[["f","w"],["m",["M","F"]]],[["u","c"],[[["K","Q"],"S"],"l"]]],[[["d","r"],["h","s"]],[[["D",["J","U"]],"n"],["i",["C",["V",["3","2"]]]]]]],[[[["o","a"],["t",["B","W"]]],[["e",["A",["P","N"]]],[[",","."],["O",["L",["1",["6","5"]]]]]]],[[[["T"," "],["z",["G","E"]]],[["q","x"],["j",["Y",["0","X"]]]]],[[["k","v"],["b",["I","H"]]],[["p","y"],["g",["R",["Z",["4",["7",["9","8"]]]]]]]]]]]',
    treeArray = JSON.parse(huffmanTreeString), huffmanTree = Huffman.Tree.decodeTree(treeArray),
    huffmanEnabled = true, rc4Enabled = true, debugEnabled = false;
/** GLOBAL VARIABLES **/

// TODO: Remove
var rc4Message, huffMessage;

function detectDevice() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
  }

  srvPrint({
    entity: entity,
    isMobile : isMobile
  }, true);
}

function get(id) {
  return $('#' + id);
}

function getVal(id) {
  return get(id).val();
}

function setVal(id, value) {
  return get(id).val(value);
}

function httpGet(url, data, fnSuccess, fnFailure) {
  $.get(url, data).done(fnSuccess).fail(fnFailure);
}

function httpPost(url, data, fnSuccess, fnFailure) {
  $.post(url, data).done(fnSuccess).fail(fnFailure);
}

function srvPrint(msg, force) {
  if (!debugEnabled && !force) {
    return;
  }

  var msgMap;

  if (msg instanceof Object) {
    msgMap = msg;
  } else {
    msgMap = { console: msg };
  }

  if (isMobile) {
    httpPost('console', msgMap);
    return;
  }

  for (var prop in msgMap) {
    console.info(prop + ' -', msgMap[prop]);
  }
  console.info('**************************************');
}

function sendData(stepByStep) {
  var listCharCode = [], value;

  huffMessage = huffmanEncode(getVal('dataBox'));
  srvPrint({ huffMessage: huffMessage});
  rc4Message = rc4(huffMessage);
  srvPrint({ rc4Message: rc4Message });
  value = rc4Message;

  for (var idx in value) {
    listCharCode.push(value[idx].charCodeAt(0));
  }

  if (listCharCode.length > 0) {
    var data = convertDataToFrequency(listCharCode);
    if (!stepByStep) {
      initiateStream(data);
    } else {
      stepByStepStream(data);
    }
  }
}

function outputResult(number, message, time) {
  var dataBox = get('dataBox'), dataBoxHtml = dataBox.html(),
      outputMessage, success = '';

  rc4Message = rc4(message);
  srvPrint({ rc4Message: rc4Message });
  huffMessage = huffmanDecode(rc4Message);
  srvPrint({ huffMessage: huffMessage });

  outputMessage = huffMessage;

  if (outputMessage != text) {
    success = 'FALHA!';
  }

  dataBox.html(dataBoxHtml + '<p>' + number + ' ' + outputMessage + ' ' + time + ' - ' + success + '</p>');
}

function processMessageData(frequencies) {
  var binary = '', color, success;

  for (var f in frequencies) {
    var ev = frequencies[f] - startDataFreq;
    binary = rpad(binary, ev / 100) + '1';
  }

  binary = rpad(binary, 40);
  var decArray = toDecimalArray(binary);

  success = (generateCrc(decArray) === 0);

  decArray.splice(-1); //Remove CRC

  return {
    success: success,
    data: decToString(decArray)
  };
}

function equalFrequencies(list1, list2) {
  var isEqual = true;

  if (!list1 || !list2 || list1.length != list2.length) {
    return false;
  }

  for (var i = 0; i < list1.length; i++) {
    if (list1[i] !== list2[i]) {
      isEqual = false;
      break;
    }
  }

  return isEqual;
}

function preparePackToSend(array /*Receives a decimal array size 4*/) {
  var str = '', pack = [];

  if (array.length > 4) {
    alert('Problem to generate package!');
    return;
  }

  for (var i = 0; i < array.length; ++i) {
    str = str + pad(parseInt(array[i], 10).toString(2));
  }

  str = str + pad(parseInt(generateCrc(array), 10).toString(2));

  return str;
}

function textToFrequency(txt) {
  var listCharCode = [];

  for (var idx in txt) {
    listCharCode.push(txt[idx].charCodeAt(0));
  }

  if (listCharCode.length > 0) {
    return convertDataToFrequency(listCharCode);
  }
}

function convertDataToFrequency(totalData) {
  var result = [], freq, sum;

  while (totalData.length > 0) {
    var pack = preparePackToSend(totalData.splice(0,4)).split(''),
        partial = [];

    sum = 40 - pack.length;

    while (sum > 0) {
      pack.splice(-8, 0, '0');
      sum = 40 - pack.length;
    }

    for (var idx in pack) {
      freq = startDataFreq + (idx * 100);

      if (pack[idx] == 1) {
        partial.push(freq);
      }
    }

    result.push(partial);
  }

  return result;
}

function decToString(array) {
  var str = '';

  for (var s in array) {
    str += String.fromCharCode(array[s]);
  }

  return str;
}

function toBuffer(array) {
  var buf = new Buffer(array.length);

  for (var i = 0; i < array.length; i++) {
    buf[i] = array[i];
  }
  return buf;
}

function toDecimalArray(str) {
  var array = [],
      size = str.length / 8;

  for (var i = 0; i < size; i++) {
    var point = i * 8,
      binary = str.substring(point, point + 8);
    array[i] = parseInt(binary, 2).toString(10);
  }

  return array;
}

function pad(entry) {
  var str = entry;
  while (str.length < 8) {
    str = '0' + str;
  }

  return str;
}

function rpad(entry, size) {
  var str = entry;

  while (str.length < size) {
    str = str + '0';
  }

  return str;
}

function generateCrc(array) {
  var c, crc = 0, genPoly = 0x45;

  for (var j=0; j < array.length; j++) {
    c = array[j];
    crc ^= c;
    for(var i = 0; i < 8; i++) {
      if(crc & 0x80) {
        crc = (crc << 1) ^ genPoly;
      } else {
        crc <<= 1;
      }
    }
    crc &= 0xff;
  }

  return crc;
}

function rc4(str) {
  if (!rc4Enabled) {
    return str;
  }

  var s = [], j = 0, x, res = '';

  for (var i = 0; i < 256; i++) {
    s[i] = i;
  }

  for (i = 0; i < 256; i++) {
    j = (j + s[i] + rc4Key.charCodeAt(i % rc4Key.length)) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
  }

  i = 0;
  j = 0;

  for (var y = 0; y < str.length; y++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
    res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
  }

  return res;
}

function huffmanEncode(message) {
  if (huffmanEnabled) {
    return huffmanTree.encode(message);
  }

  return message;
}

function huffmanDecode(message) {
  if (huffmanEnabled) {
    return huffmanTree.decode(message);
  }

  return message;
}
