// module.exports = function (msg) { 
//     console.log(msg);
// };

var aes256 = require('aes256');
const md5 = require('md5');
 
var key = md5('my passphraseh');
var text = 'আমি তোমাকে ভাল ';
console.log(text);
var plaintext = encodeURIComponent(text);
console.log(plaintext);
console.log(decodeURIComponent(plaintext));
 
var cipher = aes256.createCipher(key);
 
var encrypted = cipher.encrypt(plaintext);
console.log(encrypted);
var decrypted = decodeURIComponent(cipher.decrypt(encrypted));
console.log(decrypted);
