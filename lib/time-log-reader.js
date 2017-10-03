/**
 *
 * Created by pavelnovotny on 26.09.17.
 */

var fs = require("fs");
var AsyncFlow = require("./async-flow.js");
var zlib = require('zlib');
var nconf = require('nconf');
var winston = require('winston');
var utils = require('./utils');

exports.analyze = analyze;

nconf.argv()
    .env()
    .defaults({ 'TIMELOG-ENV' : 'localhost' })
    .file({ file: 'config-'+nconf.get('TIMELOG-ENV')+'.json' });

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({'timestamp':utils.timestamp, 'level': nconf.get('logLevel')})
    ]
});

var timeLogAnalyzer = require("./"+nconf.get("timeLogAnalyzer"));

function prepareGzFile(gzFile, callback) {
    var queue = new AsyncFlow.AsyncFlow();
    Object.keys(gzFile).forEach(function (file) {
        queue.pushTask(function (callback) {
            fs.stat(gzFile[file].path, function (err, stat) {
                if (err) return callback(err);
                gzFile[file].stat = stat;
                callback();
            });
        });
        queue.pushTask(function (callback) {
            fs.open(gzFile[file].path, "r", function (err, fd) {
                if (err) return callback(err);
                gzFile[file].fd = fd;
                callback();
            });
        });
    });
    queue.allParallel(callback);
}


function processFiles(files, callback) {
    var queue = new AsyncFlow.AsyncFlow();
    files.forEach(function(gzFile){
        queue.pushTask(function (callback) {
            processGzFile(gzFile, function(err) {
                if (err) return callback(err);
                Object.keys(gzFile).forEach(function (file) {
                    fs.close(gzFile[file].fd, function(){
                        if (err) return callback(err);
                    });
                });
                callback();
            });
        });
    });
    queue.limitedParallel(10,callback);
}

function analyze() {
    var time = (new Date()).getTime();
    var check = nconf.get("check");
    logger.info("check: " + check);
    var env = nconf.get("env");
    logger.info("env: " + env);
    var dataDir = nconf.get("paths")[env]["data"];
    var indexDir = nconf.get("paths")[env]["index"];
    var dates = nconf.get("dates").split(",");
    logger.info("dates: "+ dates);
    getFiles(dates, dataDir, indexDir, function(files){
        processFiles(files, function(err) {
            if (err) return console.log(err);
            logger.info("done in " + ((new Date()).getTime()-time) + " ms");
        });
    });
}


function getFiles(dates, dataDir, indexDir, callback) {
    var files = [];
    var queue = new AsyncFlow.AsyncFlow();
    fs.readdir(dataDir, function(err, list) {
        list.map(function(dataFile){
            dates.forEach(function(date){
                if (dataFile.endsWith(date + ".bgz") && dataFile.indexOf("other") > -1) {
                    var indexFile = indexDir + dataFile + ".ind";
                    queue.pushTask(function (callback) {
                        fs.access(indexFile, (fs.constants || fs).R_OK, function(err) {
                            if (!err) {
                                var gzFile = {
                                    index : {path: indexFile},
                                    data : {path: dataDir+dataFile}
                                }
                                files.push(gzFile);
                            }
                            callback();
                        });
                    });
                }
            });
        });
        queue.allParallel(function() {
            callback(files);
        });
    });
}




function processGzFile(gzFile, callback) {
    prepareGzFile(gzFile, function (err) {
        if (err) return callback(err);
        fs.read(gzFile.index.fd, new Buffer(4), 0, 4, 0, function (err, bytes, fileBuf) {
            if (err)  return callback(err);
            var blockPos = fileBuf.readIntBE(0, 4) * 28 + 4; //skipping header (we actually need access to ALL zipped blocks, no fancy seek using header info)
            var readSize = gzFile.index.stat.size - 8; //last is originalFileSize, not interested in
            var gunzipQueue = new AsyncFlow.AsyncFlow();
            while (blockPos < readSize) {
                addToGunzipQueue(gunzipQueue, gzFile, blockPos);
                blockPos += 16;
            }
            gunzipQueue.limitedParallel(10, callback); //concurrency number for gunzip in one file
        });
    });
}

function addToGunzipQueue(gunzipQueue, gzFile, blockPos) {
    gunzipQueue.pushTask(function (callback) {
        fs.read(gzFile.index.fd, new Buffer(32), 0, 32, blockPos, function (err, bytes, fileBuf) {
            if (err)  return callback(err);
            var gzipAddrStart = fileBuf.readIntBE(0, 8);
            var realAddrStart = fileBuf.readIntBE(8, 8);
            var gzipAddrEnd = fileBuf.readIntBE(16, 8);
            var realAddrEnd = fileBuf.readIntBE(24, 8);
            if (bytes === 24) { //end
                gzipAddrEnd = gzFile.data.stat.size;
            }
            processGzChunk(gzFile.data.fd, gzipAddrStart, gzipAddrEnd, callback);
        });
    });
}

var interruptedBlocks = {};

function processGzChunk(fdData, gzipAddrStart, gzipAddrEnd, callback) {
    var bufferSize = gzipAddrEnd - gzipAddrStart;
    fs.read(fdData, new Buffer(bufferSize), 0, bufferSize, gzipAddrStart, function (err, bytes, buffer) {
        if (err) return callback(err);
        zlib.gunzip(buffer, function (err, result) {
            if (err) return callback(err);
            // console.log(gzipAddrStart +" "+ gzipAddrEnd);
            processChunk(result.toString(), callback);
        });
    });
}

function processChunk(chunk, callback) {
    var lastPosition = chunk.lastIndexOf("\n[");
    var firstPosition = chunk.indexOf("\n[");
    var lastRec = chunk.substring(lastPosition);
    var firstRec = chunk.substring(0, firstPosition);
    chunk = chunk.substring(firstPosition, lastPosition);
    //todo process interruptedBlocks
    // console.log(firstRec);
    // console.log(lastRec);
    //interruptedBlocks[blockNum] = {firstRec: firstRec, lastRec: lastRec};
    timeLogAnalyzer.processChunk(chunk);
    callback();
}


