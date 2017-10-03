/**
 *
 * Created by pavelnovotny on 26.09.17.
 */

var funcs = [
    function(callback) {
        setTimeout(function(){
            console.log("900");
            callback();
        }, 900);
    },
    function(callback) {
        setTimeout(function(){
            console.log("700");
            callback();
        }, 700);
    },
    function(callback) {
        setTimeout(function(){
            console.log("500");
            callback();
        }, 500);
    },
    function(callback) {
        setTimeout(function(){
            console.log("300");
            callback();
        }, 300);
    },
    function(callback) {
        setTimeout(function(){
            console.log("300");
            callback();
        }, 300);
    }
];

function *funcGenerator(funcs, stepCallback, finishCallback) {
    var done=0;
    for(var i=0; i<funcs.length; i++) {
        yield funcs[i](function() {
            console.log("step "+done+" done.");
            stepCallback();
            if (++done === funcs.length) {
                finishCallback();
            }
        });
    }
}

function allParallel() {
    var currentTime = (new Date()).getTime();
    var fGen = funcGenerator(funcs
        ,function() {
            console.log("step finished in " + ((new Date()).getTime() - currentTime));
        },function() {
            console.log("all tasks finished in " + ((new Date()).getTime() - currentTime));
        });
    while(!fGen.next().done);
}
//allParallel();

function sequential() {
    var currentTime = (new Date()).getTime();
    var fGen = funcGenerator(funcs
        ,function() {
            console.log("step finished in " + ((new Date()).getTime() - currentTime));
            fGen.next();
        },function() {
            console.log("all tasks finished in " + ((new Date()).getTime() - currentTime));
        });
    fGen.next();
}
//sequential();

function limitedParallel(concurrency) {
    var currentTime = (new Date()).getTime();
    var fGen = funcGenerator(funcs
        ,function() {
            console.log("step finished in " + ((new Date()).getTime() - currentTime));
            fGen.next();
        },function() {
            console.log("all tasks finished in " + ((new Date()).getTime() - currentTime));
        });
    while(concurrency-- > 0) {
        if(fGen.next().done) break;
    }
}
limitedParallel(2);
