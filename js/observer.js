// 观察者模式

class Subject {
  constructor() {
    this.observer = []
  }
  add(ob) { // 添加订阅者
    const has = this.observer.some(i => i == ob)
    if (!has) {
      this.observer.push(ob)
    }
  }
  remove(ob) { // 删除订阅者
    const index = this.observer.findIndex(i => i == ob)
    index > -1 && this.observer.splice(index, 1)
  }
  notify() { // 发布通知
    this.observer.forEach(i => {
      i.update()
    })
  }
}

class Observer {
  constructor(name) {
    this.name = name
  }
  update() { // 收到通知后的回调
    console.log(`我收到通知了，我的名字是 ${this.name}`)
  }
}

let sub1 = new Subject()
let sub2 = new Subject()

let ob1 = new Observer('1')
let ob2 = new Observer('2')
let ob3 = new Observer('3')

sub1.add(ob1)
sub1.add(ob2)
sub1.notify()

sub2.add(ob2)
sub2.add(ob3)
sub2.notify()

