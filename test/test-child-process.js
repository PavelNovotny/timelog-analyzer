/**
 *
 * Created by pavelnovotny on 22.09.17.
 */
var exec = require('child_process').exec;
var fs = require('fs');

var result = '';

var child = exec('gunzip -c other_s4_alsb_aspect.time.20170919.bgz');
var output = fs.createWriteStream('other_s4_alsb_aspect.time.20170919.txt');


child.stdout.on('data', function(data) {
   console.log(data);
    output.write(data);

});

child.on('close', function() {
    console.log('done');
    output.close();
});

child.on('error', function(e) {
    console.log(e);
});
