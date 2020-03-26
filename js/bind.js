/**
 * bind() 方法会创建一个新函数
 * 当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数
 */

function diyBind(Obj, ...arg1) {
  if (typeof this !== "function") {
    throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
  }
  const Fn = this
  const fNop = function() {

  }
  const fbound = function(...arg2) {
    const arg = arg1.concat(arg2)
    Fn.apply(Obj, arg)
    // new的时候 this指向实例
    return Fn.apply(this instanceof fNop ? this : Obj, arg);
  }
  fNop.prototype = Fn.prototype
  fbound.prototype = new fNop()
  return fbound
}
Function.prototype.diyBind = diyBind


/**
 * 测试
 */
var obj = {
  name: '瓦特',
};
function original(a, b){
  this.name = b
}
var bound1 = original.bind(obj, 1);
console.log('1-1 ', bound1(2))
console.log('1-3 ', new bound1(2))

var bound = original.diyBind(obj, 1);
console.log('2-1 ', bound(2));
console.log('2-3 ', new bound(2))
