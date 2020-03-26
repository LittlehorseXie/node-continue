/**
 * 改变了 this 的指向
 * 自动执行
 */

 function diyCall(context, ...arg) {
  var context = Object(context) || window
  context.fn = this
  const res = context.fn(...arg)
  delete context.fn
  return res
 }

 Function.prototype.diyCall = diyCall

/**
* 测试
*/
var value = 3
var foo = {
  value: 1
};
function bar(name, age) {
  console.log(name, age, this.value);
}
bar.diyCall(foo, 'test', 18); // test 18 1
bar.diyCall(null) // undefined undefined undefined
function bar2(name, age) {
  return {
    name, age, value: this.value
  }
}
console.log(bar2.diyCall(foo, 'halo', 19)) // { name: 'halo', age: 19, value: 1 }
console.log(bar2.diyCall(null)) // { name: undefined, age: undefined, value: undefined }
