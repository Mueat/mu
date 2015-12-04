;!function(mu){
	
	var config = {
		name:'modal',
		files:['/assets/vendor/layer/skin/layer.css','/assets/vendor/layer/layer.js'],
		callback:function(){
			layerLoaded = true;
			layer.config({
			    skin: 'layui-layer-molv',
			    extend: '/assets/vendor/layer/extend/layer.ext.js',
			    scrollbar :false
			})
		}
	}

	mu.layer = function(callback){
		var index =  mu.queue(callback,config);
		return index;
	}

	var plugin = function(){
		var element = this.element;

		this.modal = function(title,width,height,isfull){
			return mu.layer(function(){
				var index = layer.open({
					type:1,
					title:title,
					content:element,
					area:[typeof(width) != 'undefined' ? width:'800px',typeof(height) != 'undefined' ? height:'500px']
				});
				if(typeof(isfull) != 'undefined') layer.full(index);
				element.attr('mu-tips-index',index);
				return index;
			})
		}

		this.tips = function(message,der,time){
			var ders = 2;
			if(typeof(der) != 'undefined' ){
				switch(der.toLowerCase()){
					case "top":
					ders = 1;
					break;
					case "bottom":
					ders = 3;
					break;
					case "left":
					ders = 4;
					break;
				}
			}

			time = typeof(time) != 'undefined' ? time:3000;

			return mu.layer(function(){
				var index = layer.tips(message, element, {tips: ders,time:time});
				element.attr('mu-tips-index',index);
				return index;
			})
		};

		return this;
	}

	mu.alert = function(message,callback){

		return mu.layer(function(){

			return layer.alert(message,function(index){
				if(typeof(callback) != 'undefined') callback();
				layer.close(index);
			});
		})
	};

	mu.confirm = function(message,yesFn,noFn){
		return mu.layer(function(){
			return layer.confirm(message,function(index){
				layer.close(index);
			    if(typeof(yesFn) == 'function') yesFn();
			},function(index){
				layer.close(index);
			    if(typeof(noFn) == 'function') noFn();
			})
		})
	};

	mu.msg = function(message,time,callback){
		var msgTime = typeof(time) != 'undefined' ? time : 2000;
		return mu.layer(function(){
			return layer.msg(message,{time:msgTime,skin:'layui-layer-hui'},callback);
		})
	}

	mu.iframe = function(url,title,width,height,isfull){
		return mu.layer(function(){
			var index = layer.open({
				type:2,
				title:title,
				content:url,
				area:[typeof(width) != 'undefined' ? width:'800px',typeof(height) != 'undefined' ? height:'500px']
			});
			if(typeof(isfull) != 'undefined') layer.full(index);
			return index;
		})
	}

	mu.closeModal = function(parm){
		if(typeof(parm) == 'undefined')
		layer.closeAll();
		else if(typeof(parm) == 'string' || typeof(parm) == 'object'){
			layer.close($(parm).attr('mu-tips-index'));
			$(parm).removeAttr('mu-tips-index');
		}
		else if(typeof(parm) == 'number')
		layer.close(parm);
	}

	//window.alert = mu.alert;

	mu.plugin('dialog',plugin);
}(mu)