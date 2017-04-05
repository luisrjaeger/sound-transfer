var RC4 = require('simple-rc4');

var key = new Buffer([1, 2, 3, 4]);
var msg = new Buffer('secret');
console.log('input:     ', msg.toString(), ' == ', msg.toString('hex'));
 
// create encryption instance 
var enc = new RC4(key);
enc.update(msg);
console.log('encrypted: ', msg.toString(), ' == ', msg.toString('hex'));
 
// create decryption instance (equals encryption instance) 
var dec = new RC4(key);
dec.update(msg);
console.log('output:    ', msg.toString(), ' == ', msg.toString('hex'));
