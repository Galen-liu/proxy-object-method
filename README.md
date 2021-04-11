# proxy-object-method
rear or prefix proxy util for object method

# features
- cheap way to add prefix/rear logic for any method in object
- register logic by chain
- execute prefix/rear logic in concurrence way
- custom define when to execute prefix/rear logic
- all execute by promise

# usage
- basic usage 
```javascript
const ProxyObjMethod = require('proxy-object-method');
const target = {
  main (...args) {
    console.log(`main args: ${args.slice(0, -1)} ret: ${JSON.stringify(args[args.length - 1])}`)
    return true;
  }
}

const newTarget = new ProxyObjMethod(target)
 .prefix('main', function a (...args) {
   console.log(`prefix-a args: ${args.slice(0, -1)} ret: ${JSON.stringify(args[args.length - 1])}`); 
   return 'prefix1';
 })          
 .rear('main', function b (...args) {
   console.log(`rear-b args: ${args.slice(0, -1)} ret: ${JSON.stringify(args[args.length - 1])}`); 
   return 'rear1';
 })
  .end();                                                       // return proxy object

 newTarget
   .main(1, 2)
   .then(
     result => console.log('function result: ', result),
     err    => console.error('test failed and error:', err)
   );

/*
output: 

prefix-a args: 1,2 ret: {}
main args: 1,2 ret: {"a":"prefix1"}
rear-b args: 1,2 ret: {"a":"prefix1","main":true}
function result:  true
*/
```

- concurrence execute
```javascript
const target = {
  main (...args) {
    console.log(`main args: ${args.slice(0, -1)} ret: ${JSON.stringify(args[args.length - 1])}`)
    return true;
  }
}

// a1 and a2 will be concurrently executed 
const newTarget = new ProxyObjMethod(target)
 .prefix('main', [
   function a1 (...args) {
     console.log(`prefix-a1 args: ${args.slice(0, -1)} ret: ${JSON.stringify(args[args.length - 1])}`); 
     return 'prefix2';
   },
   function a2 (...args) {
     console.log(`prefix-a2 args: ${args.slice(0, -1)} ret: ${JSON.stringify(args[args.length - 1])}`); 
     return 'prefix3';
   }
 ])
 .end();


 newTarget
   .main(1, 2)
   .then(
     result => console.log('function result: ', result),
     err    => console.error('test failed and error:', err)
   );
/*
output:

prefix-a1 args: 1,2 ret: {}
prefix-a2 args: 1,2 ret: {}
main args: 1,2 ret: {"a1":"prefix2","a2":"prefix3"}
function result:  true
*/

```

- custom execution condition
```javascript
const target = {
  executable: false,
  main (...args) {
    console.log(`main args: ${args.slice(0, -1)} ret: ${JSON.stringify(args[args.length - 1])}`)
    return true;
  }
}

// a1 and a2 will be concurrently executed 
const newTarget = new ProxyObjMethod(target)
 .prefix('main',
   function a (...args) {
     console.log(`prefix-a args: ${args.slice(0, -1)} ret: ${JSON.stringify(args[args.length - 1])}`); 
     return 'prefix2';
   }
 , (target) => target.executable)
 .end();

// case1:
 newTarget
   .main(1, 2)
   .then(
     result => console.log('function result: ', result),
     err    => console.error('test failed and error:', err)
   );
/*
output: 

main args: 1,2 ret: {}
function result:  true
*/

// case2: 
newTarget.executable = true;
newTarget
 .main(1, 2)
 .then(
   result => console.log('function result: ', result),
   err    => console.error('test failed and error:', err)
 );
/*
output:

prefix-a args: 1,2 ret: {}
main args: 1,2 ret: {"a":"prefix2"}
function result:  true
*/

```

# more explanation
  Proxy-object-method use the name of function to store result and will ignore the result without name.

# API
### proxyObjMethod.prefix(methodName, prefixFuncs, [conditionFn])

  Add one or multi prefix function.

  Prefix-function will be executed with method's arguments and other front prefix-function's result map. The result map of prefix-function will look like:
  { [prefixFuncName]: prefixFuncResult }

  if there are multi prefix-function, then they will be concurrently executed.

### proxyObjMethod.rear(methodName, rearFuncs, [conditionFn])

  Add one or multi rear function. 

  The rear-function works almost as same as prefix-function.

### proxyObjMethod.end()
  Return the proxy object.
  The object is single for proxyObjMethod
