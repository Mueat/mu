## 如何使用
### 引入jquery和mu.js主文件以及要用到的插件
```
<div id="main"></div>
<script src="jquery.min.js"></script>
<!--在生产环境可以把下面的JS编译下-->
<script src="mu.js"></script>
<script src="mu.view.js"></script>
<script src="mu.modal.js"></script>
<script src="mu.check.js"></script>
<script type="text/javascript">
	//配置模板文件和JS存放的目录，如下则设置为js文件存放在src目录下，模板文件存放在scr/tpl目录下
	MU_CONFIG.dir = 'src';
	//调用js
	mu.do('user');
</script>
```
### 创建一个模板 user.html
```
<div mu-tpl id="mu-index" mu-target="#main" mu-url="api/users">
	{{#each this}}
	<ul>
		<li><input type='text' name='userid' value='{{id}}' />选择</li>
		<li>姓名：{{name}}</li>
		<li>年龄：{{age}}</li>
		<li>手机：{{mobile}}</li>
		<li><a href="#!user/edit?id={{id}}">编辑</a></li>
	</ul>
	{{/each}}
	<div id="user-edit"></div>
</div>
<div mu-tpl="hide" id="mu-edit" mu-target="#user-edit">
	<form>
		<input type='hidden' name='id' id='user-id' value='{{id}}' />
		<div>姓名：<input type='text' name='name' id='user-name' value='{{name}}' /></div>
		<div>年龄：<input type='text' name='age' id='user-age' value='{{age}}' /></div>
		<div>手机：<input type='text' name='mobile' id='user-mobile' value='{{mobile}}' /></div>
	</form>
</div>
```

### 创建调用JS控制程序 user.js

```
;!function(mu){
	function index(){
        mu.open("user",function(){
			//这里写模板渲染后调用的程序，如：调用iCheck插件美化下checkbox
			mu('input[type=checkbox]').check()
        })
    }

    function edit(parm){
		var userid = parm.id;
		$.open("user.edit",function(){
			
		},"api/users/"+id);
    }

    var module = {
		index:index,
		edit:edit
	};
    mu.module('user',module);
}(mu)
```



## 核心方法
### mu.open(viewName,callback)
> 加载模板<br>
> viewName  模板名称，如果有资源名称则为模板名称.资源名称，如：user.edit<br>
>callback 回调方法


### mu.do(moduleName,parame)
> 调用模块方法，JS文件里面的方法<br>
> moduleName 为模块名称，如果有方法名，则用模块名.方法名的方式，如：user.add<br>
> parame 传入的参数，如：{id:3,category:5}


### mu.module(key,module)
> 设置模块，在JS中使用<br>
> key 模块名称，module为模块服务对象<br>
> 如 mu.module("user",user)


### mu.plugin(key,value)
> 设置插件 <br>
> key为插件名称 <br>
> value为插件函数对象 <br>


### mu.require(name,callback)
> 异步加载第三方JS<br>
> name在MU_REQUIRES中配置




## layer 弹出层 插件
> 以下方法除了mu.layer 和mu.closeModal 两个方法，其他方法均返回layer插件给出的index索引

### mu.layer(fn)
>  fn 回调方法，在fn里面直接调用layer


### mu(element).modal(title,width,height,isfull)
> 弹出包含element节点的框<br>
> element 元素id或class或对象<br>
> title 弹出框的名称<br>
> width 宽度，默认800px<br>
> height 高度，默认500px<br>
> isfull 是否全屏，默认false


### mu(element).tips(message,der,time)
> 在element节点提示tip <br>
> message 提示信息<br>
> der 方向 (top，bottom，left，right) 默认 right<br>
> time 提示框多少时间消失(单位ms) 设置为0则不消失，默认3000ms


### mu.alert(message,callback)
> 弹出提示框<br>
> message 提示框信息<br>
> callback 点击提示框确定按钮后回调函数


### mu.confirm(message,yesFn,noFn)
> 弹出确认框<br>
> message  确认框提示语<br>
> yesFn  点击确定按钮后回调函数<br>
> noFn 点击取消按钮后回调函数


### mu.msg(message,time,callback)
> 简单提示框<br>
> message  提示信息<br>
> time  多少时间后消失（单位ms），默认2秒，0则不消失<br>
> callback  提示框消失后回调


### mu.iframe(url,title,width,height,isfull)
> 弹出iframe层<br>
> url   iframe地址<br>
> 其他和mu.modal参数一样


### mu.closeModal(index)
> 关闭弹出层<br>
> index 不过不传则关闭所有弹出层<br>
> 如果传入索引则关闭该索引的弹出层<br>
> 传入dom对象（可以是#id等这种字符）则关闭该对象上的弹出层


## iCheck 插件


### mu.icheck(fn) 
> 在fn回调中直接调用icheck方法


### mu(element).check(state,fn,fn2)
> 初始化、设置状态、取值、设置值

- 初始化
> mu("input[type=checkbox]").check()


- 设置状态
> mu("input[type=checkbox]").check("check")<br>
> 可设置的状态有check||uncheck||toggle||disable||enable||indeterminate||determinate||update||destroy<br>
> 可传第二个参数 fn ，则设置好状态后回调fn


- 取值
> mu("input[type=checkbox]").check("value",'#')<br>
> 取得被选中的值，默认用逗号分隔，如果传入第二个参数则用第二个参数分隔


- 设置值
> mu("input[type=checkbox]").check("check",'1,2,3',fn)<br>
> 设置值为1，2，3的项为选中状态<br>
> 第一个参数可已设置uncheck等，和上面设置状态参数一样<br>
> 第二个参数为要选定的项的值，用逗号分隔<br>
> 第三个参数为回调函数<br>


- 绑定
> mu(element1).check("bind",element2)<br>
> element1的状态根据element2的状态的改变而改变，element2选中，则element1也选中<br>
> element2 必需为1个元素，不能是一组元素
