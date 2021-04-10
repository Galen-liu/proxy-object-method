const { strict: assert } = require('assert');
const ProxyObjMethod = require('./index.js');



const fnArgs1 = 20;
const fnArgs2 = 21;

const bRes = 'rearB';
const b1Res = 'rear1B';
const b2Res = 'rear2B';

const aRes = 'prefixA';
const a1Res = 'prefixA1';
const a2Res = 'prefixA2';
const mainRes = true;

const target = {
  main () {
    return mainRes;
  }
}

const newTarget = new ProxyObjMethod(target)
  .prefix('main', function a (args1, args2, ret) {
      assert.equal(fnArgs1, args1, 'Invalid Params args1');
      assert.equal(fnArgs2, args2, 'Invalid Params args2');
      assert.equal(Reflect.ownKeys(ret).length, 0, 'Invalid quantity of rear/prefix function result');

      return aRes;
    }
  )
   .prefix('main', [
     function a1 (args1, args2, ret) {
       assert.equal(fnArgs1, args1, 'Invalid Params args1');
       assert.equal(fnArgs2, args2, 'Invalid Params args2');

       assert.equal(Reflect.ownKeys(ret).length, 1, 'Invalid quantity of rear/prefix function result');
       assert.equal(ret.a, aRes, 'Invalid a function result');

       return a1Res;
     },
     function a2 (args1, args2, ret) {
       assert.equal(fnArgs1, args1, 'Invalid Params args1');
       assert.equal(fnArgs2, args2, 'Invalid Params args2');

       assert.equal(Reflect.ownKeys(ret).length, 1, 'Invalid quantity of rear/prefix function result');
       assert.equal(ret.a, aRes, 'Invalid a function result');
       return a2Res;
     }
  ])
  .rear('main', function b (args1, args2, ret) {
      assert.equal(fnArgs1, args1, 'Invalid Params args1');
      assert.equal(fnArgs2, args2, 'Invalid Params args2');

      assert.equal(Reflect.ownKeys(ret).length, 4, 'Invalid quantity of rear/prefix function result');
      assert.equal(ret.main, mainRes, 'Invalid main function result');      
      assert.equal(ret.a, aRes, 'Invalid a function result');
      assert.equal(ret.a1, a1Res, 'Invalid a1 function result');
      assert.equal(ret.a2, a2Res, 'Invalid a2 function result');
      return bRes;
  })
 .rear('main', [
   function b1 (args1, args2, ret) {
      assert.equal(fnArgs1, args1, 'Invalid Params args1');
      assert.equal(fnArgs2, args2, 'Invalid Params args2');

      assert.equal(Reflect.ownKeys(ret).length, 5, 'Invalid quantity of rear/prefix function result');
      assert.equal(ret.main, mainRes, 'Invalid main function result');
      assert.equal(ret.a, aRes, 'Invalid a function result');
      assert.equal(ret.a1, a1Res, 'Invalid a1 function result');
      assert.equal(ret.a2, a2Res, 'Invalid a2 function result');
      assert.equal(ret.b, bRes, 'Invalid b function result');

      return b1Res;
   },
   function b2 (args1, args2, ret) {
      assert.equal(fnArgs1, args1, 'Invalid Params args1');
      assert.equal(fnArgs2, args2, 'Invalid Params args2');

      assert.equal(Reflect.ownKeys(ret).length, 5, 'Invalid quantity of rear/prefix function result');
      assert.equal(ret.main, mainRes, 'Invalid main function result');
      assert.equal(ret.a, aRes, 'Invalid a function result');
      assert.equal(ret.a1, a1Res, 'Invalid a1 function result');
      assert.equal(ret.a2, a2Res, 'Invalid a2 function result');
      assert.equal(ret.b, bRes, 'Invalid b function result');

      return b2Res;
    }
   ])
  .end();

newTarget
   .main(fnArgs1, fnArgs2)
   .then(
     result => console.log('test scucess and function result: ', result), 
     err    => console.error('test failed and error:', err)
   );