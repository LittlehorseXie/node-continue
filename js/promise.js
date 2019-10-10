class Promise {
  constructor(executor) {
    this.status = 'pending'
    this.value = undefined
    // 调用resolve之后才触发then内的函数执行
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []
    let resolve = value => {
      if (this.status === 'pending') {
        this.status = 'fulfilled'
        this.value = value
        this.onFulfilledCallbacks.forEach(cb => cb())
      }
    }
    let reject = value => {
      if (this.status === 'pending') {
        this.status = 'rejected'
        this.value = value
        this.onRejectedCallbacks.forEach(cb => cb());
      }
    }
    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }
  
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : err => {
      throw err
    }
    let promise2 = new Promise((resolve, reject) => {
      if (this.status !== 'pending') { 
        // 非等待态，直接执行
        setTimeout(() => {
          try {
            const x = this.status === 'fulfilled' ? onFulfilled(this.value) : onRejected(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else {
        // 如果resolve在setTomeout内执行，then时state还是pending状态 我们就需要在then调用的时候，将成功和失败存到各自的数组，一旦reject或者resolve执行的时候，调用它们
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e);
            }
          }, 0);
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e);
            }
          }, 0);
        })
      }
    })
    return promise2
  }
  catch(onRejected) {
    return this.then(null, onRejected);
  }
}


function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    reject(new TypeError('循环引用'))
  }
  let called;
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // x不是null 且 x是对象或者函数
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return;
          called = true;
          resolvePromise(promise2, y, resolve, reject)
        }, r => {
          if (called) return;
          called = true;
          reject(r)
        })
      } else { 
        // 一个普通对象/函数
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e)
    }
  } else {
    // 其他类型
    resolve(x)
  }
}

//resolve方法
Promise.resolve = function(val){
  return new Promise((resolve, reject)=>{
    resolve(val)
  });
}
//reject方法
Promise.reject = function(val){
  return new Promise((resolve, reject)=>{
    reject(val)
  });
}


/**
 * 基于Promise实现Deferred的
 * Deferred和Promise的关系
 * - Deferred 拥有 Promise
 * - Deferred 具备对 Promise的状态进行操作的特权方法（resolve reject）
 */
Promise.deferred = function() { // 延迟对象
  let defer = {};
  defer.promise = new Promise((resolve, reject) => {
      defer.resolve = resolve
      defer.reject = reject
  });
  return defer;
}

// race方法 
Promise.race = function(promises){
  return new Promise((resolve, reject)=>{
    for(let i = 0; i < promises.length; i++){
      promises[i].then(resolve, reject)
    };
  })
}
//all方法(获取所有的promise，都执行then，把结果放到数组，一起返回)
Promise.all = function(promises){
  let arr = []
  let i = 0
  function processData(index,data){
    arr[index] = data
    i++
    if(i == promises.length){
      resolve(arr)
    };
  };
  return new Promise((resolve, reject)=>{
    for(let i = 0; i < promises.length; i++){
      promises[i].then(data => {
        processData(i,data)
      }, reject)
    };
  });
}

module.exports = Promise

// 测试 
// npm i -g promises-aplus-tests
// promises-aplus-tests js/promise.js 