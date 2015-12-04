var MU_CONFIG = {
	dir:'',
	ext:'html',
	view:{},
	module:{}, //js处理函数配置 如 user:/module/member.js
	debug:true
};
var MU_MODULECACHE = {}; //模块缓存
var MU_PLUGIN = {}; //插件对象
var MU_QUEUE = {}; //队列
/*
{
	name:"xxx" ,
	requires:[xxx,xxx,xxx],
	files:[xxx,xxx,xxx],
	callback:fn
}
*/
var MU_REQUIRES = {};

var mu = function(element){
	var m = {};
	m.element = $(element);

	for(var wg in MU_PLUGIN){
		MU_PLUGIN[wg].call(m);
	}
	
	return m;
}

mu.include = function(pluginFiles,pluginCallback){

	var unloaded = pluginFiles.length;

	function callback(){
		unloaded --;
		if(unloaded == 0 && typeof(pluginCallback) == 'function') pluginCallback();
	}

	for(var i=0;i<pluginFiles.length;i++){
		var path = pluginFiles[i];
		var ext = path.substr(-3).toLowerCase();
		if(ext == 'css'){ 			
			loadCSS(path);
		}else if(ext == '.js'){ 
			loadJS(path)
		}
	}

	function loadCSS(path){
		var script = document.createElement("link");
	    script.rel = "stylesheet";
	    script.type = "text/css";
	    script.href = path;
	    if (script.readyState){ //IE 
			script.onreadystatechange = function(){ 
				if (script.readyState == "loaded" || script.readyState == "complete"){ 
					script.onreadystatechange = null; 
					callback();
				} 
			}; 
		}else { 
			script.onload = function(){ 
				callback();
			}; 
		} 
		var head = document.getElementsByTagName('head'); 
		if(head&&head.length){ 
			head = head[0]; 
		}else{ 
			head = document.body; 
		} 
	    head.appendChild(script);
	    script = null;
	}

	function loadJS(path){
		if(path.indexOf('http://') === 0 || path.indexOf('https://') === 0 || path.indexOf('//') === 0){
			var script = document.createElement("script");
			script.src = path;
			if (script.readyState){ //IE 
				script.onreadystatechange = function(){ 
					if (script.readyState == "loaded" || script.readyState == "complete"){ 
						script.onreadystatechange = null; 
						callback();
					} 
				}; 
			}else { 
				script.onload = function(){ 
					callback();
				}; 
			} 
		    document.appendChild(script);
		    script = null;
		}else{
			$.get(path,function(){
				callback();
			});
		}
	}
	
}

//调用模块方法
mu.do = function(handle,param){
	var aHandle = handle.split('.');
	var moduleName = aHandle[0];
	var methodName = aHandle.length>1 ? aHandle[1] : 'index';
	
	if(typeof(MU_MODULECACHE[moduleName]) == 'undefined'){
		
		var path = '';
		if(typeof(MU_CONFIG.module[moduleName]) == 'undefined'){
			path = '/'+MU_CONFIG.dir+'/'+moduleName+'.js';
			if(MU_CONFIG.debug){
				path += '?'+Math.random();
			}
		}else{
			path = MU_CONFIG.module[moduleName];
		}

		$.get(path,function(data){
			MU_MODULECACHE[moduleName][methodName](param);
		}).error(function() {
			this.open(moduleName);
		});
	}else{
		MU_MODULECACHE[moduleName][methodName](param);
	}
}

//设置模块缓存
mu.module = function(module_key,module){
	if(typeof(module) == 'undefined'){
		return MU_MODULECACHE[module_key];
	}else{
		MU_MODULECACHE[module_key] = module;
	}
}

//设置插件
mu.plugin = function(key,v){
	if(typeof(v) == 'undefined'){
		return MU_PLUGIN[key];
	}else{
		MU_PLUGIN[key] = v;
	}
}

//解析url
mu.parseURL = function (url) {  
	 var a =  document.createElement('a');  
	 a.href = url;  
	 var urlObj = {  
	 	source: url,  
	 	protocol: a.protocol.replace(':',''),  
	 	host: a.hostname,  
	 	port: a.port,  
	 	query: a.search,  
		params: (function(){  
		     var ret = {},  
		         seg = a.search.replace(/^\?/,'').split('&'),  
		         len = seg.length, i = 0, s;  
		     for (;i<len;i++) {  
		         if (!seg[i]) { continue; }  
		         s = seg[i].split('=');  
		         ret[s[0]] = s[1];  
		     }  
		     return ret;  
		 })(),  
	 	file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],  
	 	hash: a.hash.replace('#',''),  
	 	path: a.pathname.replace(/^([^\/])/,'/$1'),  
	 	relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],  
	 	segments: a.pathname.replace(/^\//,'').split('/')  
	 }; 
	 a = null;
	 return urlObj; 
};

//模板解析方法
mu.compile = function(source,data,callback){
	var template = Handlebars.compile(source)
	var html = template(data);
	callback(html);
}

//队列方法

mu.queue = function(callback,config){
	
	if(typeof(config.ready) != 'undefined'){
		if(config.ready === true) return callback();
	}

	var pluginName = config.name;
	if(typeof(MU_QUEUE[pluginName]) == 'undefined'){
		MU_QUEUE[pluginName] = [];
	}
	MU_QUEUE[pluginName].push(callback);
	
	if(MU_QUEUE[pluginName].length != 1) return MU_QUEUE[pluginName].length;
	
	var excQueue = function(){
		config.ready = true;
		if(typeof(config.callback) == 'function') config.callback();

		for (var i = 0; i < MU_QUEUE[pluginName].length; i++) {

			MU_QUEUE[pluginName][i]();
		};
	}
	
	mu.include(config.files,excQueue);

	return 1;
}

mu.require = function(name,callback){
	
	if(typeof(MU_REQUIRES[name]) == 'undefined') return;
	if(typeof(MU_REQUIRES[name].requires) != 'undefined'){
		var requires = MU_REQUIRES[name].requires
		var fnc = function(){
			for (var i = 0; i < requires.length; i++){
				if(typeof(MU_REQUIRES[requires[i]].ready) == 'undefined' || MU_REQUIRES[requires[i]].ready !== true) return;
			}
			mu.queue(callback,MU_REQUIRES[name]);
		}
		
		for (var i = 0; i < requires.length; i++) {
			if(i == (requires.length-1) )
			mu.require(requires[i],fnc)
			else
			mu.require(requires[i],fnc)
		};
	}else{
		mu.queue(callback,MU_REQUIRES[name]);
	}
	
}









