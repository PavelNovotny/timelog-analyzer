/**
 *
 * Created by pavelnovotny on 26.09.17.
 */

var funcs = [
    function(callback) {
        setTimeout(function(){
            console.log("300");
            callback();
        }, 300);
    },
    function(callback) {
        setTimeout(function(){
            console.log("50");
            callback();
        }, 50);
    }
];

function *funcGenerator(funcs, yieldCallback, finishCallback) {
    var done=0;
    var self = this;
    for(var i=0; i<funcs.length; i++) {
        yield funcs[i](function() {
            console.log("step "+done+" done.");
            if (++done === funcs.length) {
                finishCallback();
            }
        });
    }
    yieldCallback();
}

var fGen = funcGenerator(funcs, function() {
    console.log("all tasks yielded");
}, function() {
    console.log("all tasks finished");
});

while(!fGen.next().done);

