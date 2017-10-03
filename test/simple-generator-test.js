/**
 *
 * Created by pavelnovotny on 26.09.17.
 */

function *simpleGenerator() {
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    yield 5;
    yield 6;
    yield 7;
}

var simpleGen = simpleGenerator();
console.log(simpleGen.next());
console.log(simpleGen.next());
console.log(simpleGen.next());
console.log(simpleGen.next());
console.log(simpleGen.next());
console.log(simpleGen.next());
console.log(simpleGen.next());
console.log(simpleGen.next());
console.log(simpleGen.next());

