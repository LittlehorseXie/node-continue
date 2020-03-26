/**
 * new 通过构造函数 Test 创建出来的实例可以访问到构造函数中的属性
 * new 通过构造函数 Test 创建出来的实例可以访问到构造函数原型链中的属性，也就是说通过 new 操作符，实例与构造函数通过原型链连接了起来
 * 生成的新对象会绑定到函数调用的this
 * 构造函数如果返回原始值，那么这个返回值毫无意义
 * 构造函数如果返回值为对象，那么这个返回值会被正常使用
 */

 function diyNew(Con, ...args) {
   const obj = {}
   Object.setPrototypeOf(obj, Con.prototype)
   let result = Con.apply(obj, args)
   return result instanceof Object ? result : obj
 }



 /**
  * 测试
  */
 function Test1(name, age) {
  this.name = name
  this.age = age
}
Test1.prototype.sayName = function () {
    console.log(this.name)
}
const a = diyNew(Test1, 'yck', 26)
console.log(a.name) // 'yck'
console.log(a.age) // 26
a.sayName() // 'yck'

console.log(Object.getPrototypeOf(a) === Test1.prototype) // true

function Test2(name, age) {
  this.name = name
  this.age = age
  return {
    name: 'lll'
  }
}
Test2.prototype.sayName = function () {
    console.log(this.name)
}
const b = diyNew(Test2, 'yck', 26)
console.log(b.name) // 'lll'
console.log(b.age) // undefined
b.sayName() // TypeError: b.sayName is not a function