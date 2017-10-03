/**
 *
 * Created by pavelnovotny on 26.09.17.
 */

var funcs = [
    function() {
        console.log("1");
    },
    function() {
        console.log("2");
    }
];

function *funcGenerator(funcs) {
    for(var i=0; i<funcs.length; i++) {
        yield funcs[i]();
    }
}

var fGen = funcGenerator(funcs);
while(!fGen.next().done);
