//icheck插件
;!function(mu){
	var config = {
		name:'check',
		files:['/assets/vendor/iCheck/skins/purple.css','/assets/vendor/iCheck/icheck.min.js']
	}
	
	mu.iCheck = function(callback){
		mu.queue(callback,config);
	}

	function plugin(){
		var element = this.element;

		//初始化icheck,设置状态 check||uncheck||toggle||disable||enable||indeterminate||determinate||update||destroy
		this.check = function(state,fn,fn2){
			if(typeof(state) == 'string' && state == 'value'){
				var glue = typeof(fn) == 'string'? fn : ',';
				var value = '';
				element.each(function(index, el) {
					if($(this).prop('checked'))
					value += (value != ''?',':'') + $(this).val(); 
				});
				return value;

			}
			mu.iCheck(function(){
				if(typeof(state) == 'string'){
					if(state == 'bind'){
						$(fn).on('ifChanged',function(){
							element.prop('checked',$(fn).prop('checked'));
							element.iCheck('update');
						})
					}else{
						if(typeof(fn) == 'string'){
							var values = fn.split(',');
							var filters = '';
							for (var i = 0; i < values.length; i++) {
								filters += (filters == ''?'':',') + '[value='+values[i]+']';
							};

							element.filter(filters).iCheck(state,fn2);
						}else{
							element.iCheck(state,fn);
						}
					}
				}else{
					element.iCheck({checkboxClass: 'icheckbox_square-purple',radioClass: 'iradio_square-purple'});
				}
			})
		};
	}

	mu.plugin(config.name,plugin);
}(mu)