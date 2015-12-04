;!function(mu){
	var _viewData = {}; //模板数据缓存

	var _callback = null; //回调函数
	var _loading = 0; //正在加载的ajax请求数量
	var _data = null; //传入的json数据
	var _target = null;
	var _module = null; //模块
	var _source_id = null; //资源ID

	var TPL_DEFINE = 'mu-tpl';
	var TPL_PREFIX = 'mu-';
	var TPL_TARGET = 'mu-target';
	var TPL_TARGET_DEFAULT = '#main-container';
	var TPL_URL = 'mu-url';

	function init(view,callback,jsonData,target){
		_loading = 0;
		var viewArray = view.split('.');
		_module = viewArray[0];
		_source_id = viewArray.length>1 ? viewArray[1] : null;
		_callback = typeof(callback) == 'function' ? callback : null;
		_data = null;
		if(typeof(jsonData) == 'object'){
			if(!_source_id) _data = jsonData;
			else{
				_data = {};
				_data[_source_id] = jsonData;
			}
		}else if(typeof(jsonData) == 'string'){
			getJsonData(jsonData);
			return;
		}
		loadView();
		
	}

	function getJsonData(url){
		$.getJSON(url, function(json, textStatus) {
			if(json.code != 200){
				json.data = {};	//无数据或无权限获得数据的情况
			}

			if(!_source_id) _data = json.data;
			else{
				_data = {};
				_data[_source_id] = json.data;
			}

			loadView();
		});
	}

	//加载模板
	function loadView(){
		if(typeof(_viewData[_module]) == 'undefined'){
			var pageUrl = getPageUrl();
			$.get(pageUrl,function(data){
				//组装模板
				var tempDom = $('<div>'+data+'</div>');
				_viewData[_module] = {};
				$(tempDom).find('['+TPL_DEFINE+']').each(function(index, el) {
					
					var source_id = $(this).attr('id');
					source_id = source_id.replace(TPL_PREFIX,'');

					var target = $(this).attr(TPL_TARGET)?$(this).attr(TPL_TARGET):TPL_TARGET_DEFAULT;
					var url = $(this).attr(TPL_URL);
					var eleData = { 
						moudle:_module,
						source_id:source_id,
						source:$(this).html(), 
						url:url,
						target:target, 
						hide:$(this).attr(TPL_DEFINE),
						data:null,
						html:null
					};
					
					_viewData[_module][source_id] = eleData;
				});
				tempDom = null;
				loadData();
			})
		}else{
			loadData();
		}
	}

	//加载数据
	function loadData(){
		if(_data == null){
			_data = {};
			if(_source_id == null){
				for(var source_id in _viewData[_module]){
					if(_viewData[_module][source_id].data == null){ //如果没有加载过数据，则加载
						if(_viewData[_module][source_id].hide != 'hide') getJsonData(source_id);
					}else{ //否则使用缓存的数据
						_data[source_id] = _viewData[_module][source_id].data;
					}
				}
			}else{
				if(_viewData[_module][_source_id].data == null){
					getJsonData(_source_id);
				}else{
					_data[_source_id] = _viewData[_module][_source_id].data;
				}
			}
		}
		setData();
	}

	function getJsonData(source_id){
		if(_viewData[_module][source_id].url && _viewData[_module][source_id].url != ''){
			_loading++;
			$.getJSON(_viewData[_module][source_id].url, function(json, textStatus) {
				
				if(json.code == 200){
					_data[source_id] = json.data;
				}else{
					_data[source_id] = {}; //如果取出来的数据没有或没权限的情况

				}
				_loading -- ;
				setData();
			});
		}
	}

	//设置view数据

	function setData(){
		if(_loading == 0) {
			if(_source_id != null){
				_viewData[_module][_source_id].data = _data[_source_id];
			}else{
				for(var temp_data in _data){
					_viewData[_module][temp_data].data = _data[temp_data];
				}
			}

			display();
		}
	}


	function display(){

		if(_source_id != null){
			compileSource(_source_id);
		}else{
			for(var source_id in _viewData[_module]){
				compileSource(source_id);
			}
		}
		if(typeof(_callback) == 'function') _callback();
	}

	function compileSource(sourceid){
		var source = _viewData[_module][sourceid];
		if(_source_id || source.hide != 'hide'){
			var data = source.data || {};
			mu.compile(source.source,data,function(html){
				source.html = html;
				$(source.target).html(source.html);
			});
		}
		//var template = Handlebars.compile(source)
		
		
	}

	//获取模板的路径
	function getPageUrl(){
		if(typeof(MU_CONFIG.view[_module]) == 'undefined'){
			path = '/'+MU_CONFIG.dir+'/tpl/'+_module+'.'+MU_CONFIG.ext;
			if(MU_CONFIG.debug){
				path += '?'+Math.random();
			}
		}else{
			path = MU_CONFIG.view[pageName];
		}
		return path;
	}

	function clear(view){
		var viewArray = view.split('.');
		var module = viewArray[0];
		var source_id = viewArray.length>1 ? viewArray[1] : null;
		if(source_id) {
			_viewData[module][source_id].data = null;
			_viewData[module][source_id].html = null;
		}else{
			delete _viewData[module];
		}

	}

	mu.open = init;
	mu.clearCache = clear;
}(mu)