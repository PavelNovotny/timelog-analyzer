/**
 *
 * Created by pavelnovotny on 26.09.17.
 */
exports.AsyncFlow = AsyncFlow;

function AsyncFlow() {
    this.queue = [];
}

AsyncFlow.prototype.pushTask = function (task) {
    this.queue.push(task);
}

AsyncFlow.prototype.funcGenerator = function *(funcs, stepCallback, finishCallback) {
    var done=0;
    var self = this;
    for(var i=0; i<self.queue.length; i++) {
        yield self.queue[i](function(err) {
            if (err) return finishCallback(err);
            stepCallback();
            if (++done === self.queue.length) {
                finishCallback();
            }
        });
    }
}

AsyncFlow.prototype.allParallel = function(callback) {
    this.limitedParallel(Number.MAX_SAFE_INTEGER, callback);
}

AsyncFlow.prototype.sequential = function(callback) {
    this.limitedParallel(1, callback);
}

AsyncFlow.prototype.limitedParallel = function(concurrency, callback) {
    var fGen = this.funcGenerator(this.queue
        ,function() {
            fGen.next();
        },function(err) {
            callback(err);
        });
    while(concurrency-- > 0) {
        if(fGen.next().done) break;
    }
}
