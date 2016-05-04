(function(window){
	var $ = window.$ = require('jquery');
	var remote = require('remote');
	var dialog = remote.require('dialog');
	var browserWindow = remote.require('browser-window');
	var fs = remote.require('fs');
	var Sequelize = remote.require('sequelize');
	var sqlite = remote.require('sqlite3');
	// console.log(diffdir);

	window.main = new (function(){
		this.desktopUtils = remote.require('desktop-utils');
		this.dataDir = this.desktopUtils.getLocalDataDir('my-todays-all');
		console.log(this.dataDir);
		try {
			fs.mkdirSync(this.dataDir);
		} catch (e) {
		}
		var dbPath = remote.require('path').resolve(this.dataDir, 'db.sqlite');
		console.log(dbPath);
		this.sequelize = new Sequelize(undefined, undefined, undefined, {
			dialect: 'sqlite',
			connection: new sqlite.Database( dbPath ),
			storage: dbPath
		});

		this.openSettings = function(){
			var elm = document.getElementById('settings');
			elm.open();
			document.querySelector('iron-list').items = [
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
			setTimeout(function(){
				elm.fit();
			}, 100);
		}
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

	});

})(window);
