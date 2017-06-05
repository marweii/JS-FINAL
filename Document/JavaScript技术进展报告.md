# **JavaScript技术进展报告**

- 课程名称：跨平台脚本开发技术

- 实验项目：JS技术进展报告

- 专业班级：软件1404

- 学生学号：3141404

- 学生姓名：蒋琪楠

- 实验指导老师：郭鸣

  ## 

## Javascript语言新技术动向：generator

generator（生成器）是ES6标准引入的新的数据类型。一个generator看上去像一个函数，但可以返回多次。

ES6的很多特性都跟Generator扯上关系，而且实际用处比较广， 包含了任何需要异步的模块， 比如ajax， filesystem， 或者数组对象遍历等都可以用到；

### 1.generator的使用

Generator函数和普通的函数区别有两个， 1：function和函数名**之间有一个\*号**， 2：函数体内部使用了**yield表达式**；比如这样：

```javascript
function* gen() {
    yield "1";
    yield "2"
}
```

这个玩意儿如果运行的话，会返回一个Iterator实例， 然后再执行Iterator实例的**next()**方法， 那么这个函数才开始真正运行， 并把yield后面的值**包装成固定对象并返回**，直到运行到函数结尾， 最后再返回**undefined**； 

```javascript
"use strict";
function* fibonacci() {
    yield 1;
    yield 2;
}

var it = fibonacci();
console.log(it);          // "Generator {  }"
console.log(it.next());   // 1
console.log(it.next());   // 2
console.log(it.next()); //undefined
```

### 2.yield

​        Generator函数返回的Iterator运行的过程中，如果碰到了yield， 就会把yield后面的值返回， 此时函数相当于停止了， 下次再执行next()方法的时候， 函数又会从上次退出去的地方重新开始执行；

　　如果把**yield**和**return**一起使用的话， 那么return的值也会作为最后的返回值， 如果return语句后面还有yield， 那么这些yield不生效：

```javascript
function* gen() {
    yield 0;
    yield 1;
    return 2;
    yield 3;
};
let g = gen();
console.log(g.next(),g.next(),g.next(),g.next());
//输出：{ value: 0, done: false } { value: 1, done: false } { value: 2, done: true } { value: undefined, done: true }
```

我们也不能在非Generator函数中使用yield，比如：

```javascript
<script>
var arr = [1, [[2, 3], 4], [5, 6]];
var flat = function* (a) {
    a.forEach(function (item) {
        if (typeof item !== 'number') {
            yield* flat(item);
        } else {
            yield item;
        }
    })
};

for (var f of flat(arr)){
    console.log(f);
}
</script>
```

上面的demo因为callback是一个普通函数， 所以编译的时候直接抛出错误提示， 我们需要改成在Generator的函数体中：

```javascript
<script>
var arr = [1, [[2, 3], 4], [5, 6]];
var flat = function* (a) {
    var length = a.length;
    for (var i = 0; i < length; i++) {
        var item = a[i];
        if (typeof item !== 'number') {
            yield* flat(item);
        } else {
            yield item;
        }
    }
};
for (var f of flat(arr)) {
    console.log(f);
}
</script>
```

或者有个更奇怪的方法，我们把数组的forEach改成Generator函数：

```javascript
<script>
var arr = [1, [[2, 3], 4], [5, 6]];
Array.prototype.forEach = function* (callback) {
    for(var i=0; i<this.length; i++) {
        yield* callback(this[i],i ,this[i]);
    }
}
var flat = function* (a) {
    yield* a.forEach(function* (item) {
        if (typeof item !== 'number') {
            yield* flat(item);
        } else {
            yield item;
        }
    })
};

for (var f of flat(arr)){
    console.log(f);
}
</script>
```

而且Iterator的return的值不会被**for...of**循环到 ， 也不会被**扩展符**遍历到， 以下Demo的**return 2** 和**yield 3**完全不生效了， 这个是要注意的；

运行下面代码

```javascript
function* gen() {
    yield 0;
    yield 1;
    return 2;
    yield 3;
};
let g = gen();
console.log([...g]); //输出：[ 0, 1 ]
for(let foo of g) {
    console.log( foo ); //输出 0, 1
}
```

### 3.next()方法

Generator函数返回的Iterator执行next()方法以后， 返回值的结构为

```javascript
{
    value : "value", //value为返回的值
    done : false //done的值为一个布尔值， 如果Interator未遍历完毕， 他会返回false， 否则返回true；
}
```

所以我们可以模拟一个**Generator生成器**， 利用闭包保存变量， 每一次执行next()方法， 都模拟生成一个{value:value,done:false}的键值对：

```javascript
function gen(array){
    var nextIndex = 0;
    return {
        next: function(){
            return nextIndex < array.length ?
            {value: array[nextIndex++], done: false} :
            {value: undefined, done: true};
        }
    };
};

var it = gen(["arr0", "arr1", "arr2", "arr3"]);
console.log( it.next() );
console.log( it.next() );
console.log( it.next() );
console.log( it.next() );
console.log( it.next() );
```

### 4.next()方法的参数

如果给next方法传参数， 那么这个参数将会作为上一次**yield语句**的返回值 ，这个特性在异步处理中是非常重要的， 因为在执行异步代码以后， 有时候**需要**上一个异步的结果， 作为下次异步的参数， 如此循环：

```javascript
<script>
function* foo(x) {
    var y = 2 * (yield (x + 1));
    var z = yield (y / 3);
    return (x + y + z);
}

var a = foo(5);
a.next() // Object{value:6, done:false}
a.next() // Object{value:NaN, done:false}
a.next() // Object{value:NaN, done:true}

var b = foo(5);
b.next() // { value:6, done:false }
b.next(12) // { value:8, done:false }
b.next(13) // { value:42, done:true }
</script>
```

### 5.throw方法()

如果执行Generator生成器的throw()方法， 如果在Iterator执行到的yield语句写在try{}语句块中， 那么这个错误会被内部的try{}catch(){}捕获 ：

```javascript
<script>
var g = function* () {
    try {
        yield;
    } catch (e) {
        console.log('内部捕获0', e);
    }
};

var i = g();
i.next(); //让代码执行到yield处；
try {
    i.throw('a');
} catch (e) {
    console.log('外部捕获', e);
}
</script>
```

### 6.return()方法

如果执行Iterator的return()方法， 那么这个迭代器的返回会被强制设置为迭代完毕， 执行return()方法的参数就是这个Iterator的返回值，此时done的状态也为true：

```javascript
<script>
function* gen() {
    yield 0;
    yield 1;
    yield 2;
    yield 3;
};
let g = gen();
console.log(g.return("heheda")); //输出：{ value: 'heheda', done: true }
</script.
```

### 7.Generator中的this和他的原型

Generator中的this就是谁调用它，那么this就是谁， 我们利用Reflect.apply可以改变Generator的上下文：

```javascript
function* gen() {
    console.log(this);
    yield 0;
};
console.log(gen().next());
console.log(Reflect.apply(gen,"heheda").next());
```

Generator生成的Iterator，不但继承了Iterator的原型， 也继承了Generator的原型：

```javascript
<script>
function* gen() {
    console.log(this);
    yield 0;
};
gen.prototype.foo = ()=> {
    console.log("foo");
}
let g = gen();
console.log(Reflect.getPrototypeOf(g) === gen.prototype); //输出：true
</script>
```

所以如果要让生成器继承方法， 我们可以这样， 感觉好酷， 但是Generator内部的this是指向原型的， 也就是说已经把原型污染了：

```javascript
<script>
function* gen() {
    this.bar = "bar";
    yield 0;
};
gen.prototype.foo = ()=> {
    console.log("foo");
}
let g = Reflect.apply(gen, gen.prototype,[]);
console.log(g.next());  //输出：Object {value: 0, done: false}
console.log(g.bar); //输出：bar
</script>
```



### 8.利用Generator函数，可以在任意对象上部署iterator接口：

```javascript
function* iterEntries(obj) {
    let keys = Object.keys(obj);
    for (let i=0; i < keys.length; i++) {
        let key = keys[i];
        yield [key, obj[key]];
    }
}

let myObj = { foo: 3, bar: 7 };

for (let [key, value] of iterEntries(myObj)) {
    console.log(key, value); //输出：foo 3 ， bar 7
}
```

## Javascript框架 vue

vue.js（读音 /vjuː/，类似于 view） 是一套构建用户界面的渐进式框架。与其他重量级框架不同的是，Vue 采用自底向上增量开发的设计。Vue 的核心库只关注视图层，它不仅易于上手，还便于与第三方库或既有项目整合。另一方面，当与单文件组件和 Vue 生态系统支持的库结合使用时，Vue 也完全能够为复杂的单页应用程序提供驱动。

### 框架原理

#### 1.声明式渲染

Vue.js 的核心是一个允许采用简洁的模板语法来声明式的将数据渲染进 DOM：

```javascript
<div id="app">
  {{ message }}
</div>
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})
```

我们已经生成了我们的第一个 Vue 应用！看起来这跟单单渲染一个字符串模板非常类似，但是 Vue 在背后做了大量工作。现在数据和 DOM 已经被绑定在一起，所有的元素都是**响应式的**。我们如何知道？打开你的浏览器的控制台（就在这个页面打开），并修改 `app.message`，你将看到上例相应地更新。

除了文本插值，我们还可以采用这样的方式绑定 DOM 元素属性：

```javascript
<div id="app-2">
  <span v-bind:title="message">
    鼠标悬停几秒钟查看此处动态绑定的提示信息！
  </span>
</div>
var app2 = new Vue({
  el: '#app-2',
  data: {
    message: '页面加载于 ' + new Date()
  }
})
```

这里我们遇到点新东西。你看到的 `v-bind` 属性被称为**指令**。指令带有前缀 `v-`，以表示它们是 Vue 提供的特殊属性。可能你已经猜到了，它们会在渲染的 DOM 上应用特殊的响应式行为。简言之，这里该指令的作用是：“将这个元素节点的 `title` 属性和 Vue 实例的 `message` 属性保持一致”。

再次打开浏览器的 JavaScript 控制台输入 `app2.message = '新消息'`，就会再一次看到这个绑定了 `title` 属性的 HTML 已经进行了更新。

#### 2.条件与循环

控制切换一个元素的显示也相当简单：

```javascript
<div id="app-3">
  <p v-if="seen">现在你看到我了</p>
</div>
var app3 = new Vue({
  el: '#app-3',
  data: {
    seen: true
  }
})
```

继续在控制台设置 `app3.seen = false`，你会发现 “现在你看到我了” 消失了。

这个例子演示了我们不仅可以绑定 DOM 文本到数据，也可以绑定 DOM **结构**到数据。而且，Vue 也提供一个强大的过渡效果系统，可以在 Vue 插入/更新/删除元素时自动应用[过渡效果](https://cn.vuejs.org/v2/guide/transitions.html)。

还有其它很多指令，每个都有特殊的功能。例如，`v-for` 指令可以绑定数组的数据来渲染一个项目列表：

```javascript
<div id="app-4">
  <ol>
    <li v-for="todo in todos">
      {{ todo.text }}
    </li>
  </ol>
</div>
var app4 = new Vue({
  el: '#app-4',
  data: {
    todos: [
      { text: '学习 JavaScript' },
      { text: '学习 Vue' },
      { text: '整个牛项目' }
    ]
  }
})
```

#### 3.处理用户输入

为了让用户和你的应用进行互动，我们可以用 `v-on` 指令绑定一个事件监听器，通过它调用我们 Vue 实例中定义的方法：

```
<div id="app-5">
  <p>{{ message }}</p>
  <button v-on:click="reverseMessage">逆转消息</button>
</div>
var app5 = new Vue({
  el: '#app-5',
  data: {
    message: 'Hello Vue.js!'
  },
  methods: {
    reverseMessage: function () {
      this.message = this.message.split('').reverse().join('')
    }
  }
})
```

#### 4.组件化应用构建

组件系统是 Vue 的另一个重要概念，因为它是一种抽象，允许我们使用小型、自包含和通常可复用的组件构建大型应用。仔细想想，几乎任意类型的应用界面都可以抽象为一个组件树：

![components](C:\Users\蒋琪楠\Desktop\components.png)

在 Vue 里，一个组件本质上是一个拥有预定义选项的一个 Vue 实例，在 Vue 中注册组件很简单：

```javascript
// 定义名为 todo-item 的新组件
Vue.component('todo-item', {
  template: '<li>这是个待办项</li>'
})
```

现在你可以用它构建另一个组件模板：

```javascript
<ol>
  <!-- 创建一个 todo-item 组件的实例 -->
  <todo-item></todo-item>
</ol>
```

但是这样会为每个待办项渲染同样的文本，这看起来并不炫酷，我们应该能将数据从父作用域传到子组件。让我们来修改一下组件的定义，使之能够接受一个[属性](https://cn.vuejs.org/v2/guide/components.html#Props)：

```javascript
Vue.component('todo-item', {
  // todo-item 组件现在接受一个
  // "prop"，类似于一个自定义属性
  // 这个属性名为 todo。
  props: ['todo'],
  template: '<li>{{ todo.text }}</li>'
})
```

现在，我们可以使用 `v-bind` 指令将待办项传到每一个重复的组件中：

```javascript
<div id="app-7">
  <ol>
    <!-- 现在我们为每个todo-item提供待办项对象    -->
    <!-- 待办项对象是变量，即其内容可以是动态的 -->
    <todo-item v-for="item in groceryList" v-bind:todo="item"></todo-item>
  </ol>
</div>
Vue.component('todo-item', {
  props: ['todo'],
  template: '<li>{{ todo.text }}</li>'
})
var app7 = new Vue({
  el: '#app-7',
  data: {
    groceryList: [
      { text: '蔬菜' },
      { text: '奶酪' },
      { text: '随便其他什么人吃的东西' }
    ]
  }
})
```

#### 5.与自定义元素的关系

你可能已经注意到 Vue 组件非常类似于**自定义元素**——它是 [Web 组件规范](https://www.w3.org/wiki/WebComponents/)的一部分，这是因为 Vue 的组件语法部分参考了该规范。例如 Vue 组件实现了 [Slot API](https://github.com/w3c/webcomponents/blob/gh-pages/proposals/Slots-Proposal.md) 与 `is` 特性。但是，还是有几个关键差别：

1. Web 组件规范仍然处于草案阶段，并且尚无浏览器原生实现。相比之下，Vue 组件不需要任何补丁，并且在所有支持的浏览器（IE9 及更高版本）之下表现一致。必要时，Vue 组件也可以包装于原生自定义元素之内。

2. Vue 组件提供了纯自定义元素所不具备的一些重要功能，最突出的是跨组件数据流，自定义事件通信以及构建工具集成。

   ​

### 使用案例

####  1.构造器

每个 Vue.js 应用都是通过构造函数 `Vue` 创建一个 **Vue 的根实例** 启动的：

```javascript
var vm = new Vue({
  // 选项
})
```



在实例化 Vue 时，需要传入一个**选项对象**，它可以包含数据、模板、挂载元素、方法、生命周期钩子等选项。全部的选项可以在 [API 文档](https://cn.vuejs.org/v2/api)中查看。

可以扩展 `Vue` 构造器，从而用预定义选项创建可复用的**组件构造器**：

```javascript
var MyComponent = Vue.extend({
  // 扩展选项
})
// 所有的 `MyComponent` 实例都将以预定义的扩展选项被创建
var myComponentInstance = new MyComponent()
```

#### 2.属性方法

每个 Vue 实例都会**代理**其 `data` 对象里所有的属性：

```javascript
var data = { a: 1 }
var vm = new Vue({
  data: data
})
vm.a === data.a // -> true
// 设置属性也会影响到原始数据
vm.a = 2
data.a // -> 2
// ... 反之亦然
data.a = 3
vm.a // -> 3
```

注意只有这些被代理的属性是**响应的**。如果在实例创建之后添加新的属性到实例上，它不会触发视图更新。我们将在后面详细讨论响应系统。

除了 data 属性， Vue 实例暴露了一些有用的实例属性与方法。这些属性与方法都有前缀 `$`，以便与代理的 data 属性区分。例如：

```javascript
var data = { a: 1 }
var vm = new Vue({
  el: '#example',
  data: data
})
vm.$data === data // -> true
vm.$el === document.getElementById('example') // -> true
// $watch 是一个实例方法
vm.$watch('a', function (newVal, oldVal) {
  // 这个回调将在 `vm.a`  改变后调用
})
```

## 自我评估

| 原创性  | 技术难度 | 工作量  |
| ---- | ---- | ---- |
| 3    | 4    | 4    |