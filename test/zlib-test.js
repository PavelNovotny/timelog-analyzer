/**
 * Created by pavelnovotny on 21.09.17.
 */
var zlib = require('zlib');
var fs = require('fs');
var input = fs.createReadStream('other_s4_alsb_aspect.time.20170919.bgz');
var output = fs.createWriteStream('other_s4_alsb_aspect.time.20170919');

var gunzip = zlib.createGunzip();
input.pipe(gunzip);

var bufferLen = 0;
gunzip.on('data', function(data) {
    // decompression chunk ready, add it to the buffer
    bufferLen+=data.toString().length;
    //buffer.push(data.toString())

}).on("end", function() {
    // response and decompression complete, join the buffer and return
    callback(null, buffer.join(""));

}).on("error", function(e) {
    console.log(e);
    console.log(bufferLen);
})
