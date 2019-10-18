// 发布订阅者模式

// 控制中心
let pubSub = {
  list: {},
  subscribe: function(key, fn) { // 订阅
    if (!this.list[key]) {
      this.list[key] = []
    }
    this.list[key].push(fn)
  },
  unsubscribe: function(key, fn) { // 取消订阅
    const fnList = this.list[key]
    if (!fnList) return
    if (!fn) {
      fnList = []
    }
    const index = fnList.findIndex(i => i == fn)
    index > -1 && fnList.splice(index, 1)
  },
  publish: function(key, ...arg) { // 发布消息
    this.list[key] && this.list[key].forEach(i => {
      i(...arg)
    })
  }
}

function a(text) {
  console.log(`上班了 ${text}`)
}

pubSub.subscribe('onwork', a)

pubSub.subscribe('launch', text => {
  console.log(`吃饭了 ${text}`)
})
pubSub.publish('onwork', '10:00:00')

pubSub.unsubscribe('onwork', a)
pubSub.publish('onwork', '10:00:00')
