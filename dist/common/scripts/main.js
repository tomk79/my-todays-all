(function(window){
	var $ = window.$ = require('jquery');
	var remote = require('remote');
	var dialog = remote.require('dialog');
	var browserWindow = remote.require('browser-window');
	// console.log(diffdir);

	window.main = new (function(){
		this.desktopUtils = remote.require('desktop-utils');
	})();

	$(window).load(function(){
		$('paper-tabs')
			.bind('iron-select', function(e){
				// console.log('selected!');
				// console.log(e);
				var $selected = $(this).find('paper-tab.iron-selected');
				// console.log($selected.attr('data-tab-name'));
				$('[data-tab-content]').hide();
				$('[data-tab-content='+$selected.attr('data-tab-name')+']').show();
			})
		;
		$('iron-list').get(0).items = [
			{
				"name": "item1",
				"longText": "long text."
			} ,
			{
				"name": "item2",
				"longText": "long text."
			} ,
			{
				"name": "item3",
				"longText": "long text."
			} ,
			{
				"name": "item4",
				"longText": "long text."
			} ,
			{
				"name": "item5",
				"longText": "long text."
			}
		];
		document.getElementById('settings').fitInto = $('body').get(0);

	});

})(window);
