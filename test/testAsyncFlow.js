/**
 *
 * Created by pavelnovotny on 26.09.17.
 */
var AsyncFlow = require("../lib/async-flow.js");
var asyncFlow1 = new AsyncFlow.AsyncFlow();
var asyncFlow2 = new AsyncFlow.AsyncFlow();

asyncFlow1.pushTask(function(callback) {
    setTimeout(function(){
        console.log("900");
        console.log("step finished in " + ((new Date()).getTime() - currentTime));
        callback();
    }, 900);
});
asyncFlow1.pushTask(function(callback) {
    setTimeout(function(){
        console.log("700");
        console.log("step finished in " + ((new Date()).getTime() - currentTime));
        asyncFlow2.limitedParallel(2, function() {
            console.log("all tasks finished in " + ((new Date()).getTime() - currentTime));
        });
        callback();
    }, 700);
});

asyncFlow2.pushTask(function(callback) {
    setTimeout(function(){
        console.log("900");
        console.log("step finished in " + ((new Date()).getTime() - currentTime));
        callback();
    }, 900);
});
asyncFlow2.pushTask(function(callback) {
    setTimeout(function(){
        console.log("700");
        console.log("step finished in " + ((new Date()).getTime() - currentTime));
        callback();
    }, 700);
});

var currentTime = (new Date()).getTime();
//asyncFlow.sequential();
// asyncFlow.allParallel();
asyncFlow1.limitedParallel(1, function() {
    console.log("all tasks finished in " + ((new Date()).getTime() - currentTime));
});


