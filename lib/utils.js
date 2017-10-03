/**
 * 
 * Created by pavelnovotny on 07.02.17.
 */

var fs = require('fs');
var dateFormat = require('dateformat');

module.exports.timestamp = function() {
    var now = new Date();
    return dateFormat(now, 'yyyymmdd;HH:MM:ss.l' );
}
