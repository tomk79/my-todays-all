/**
 * initialize
 */
module.exports = function( callback ){
	var remote = require('remote');
	var fs = remote.require('fs');

	var main = new (function(){
		var _this = this;
		this.desktopUtils = remote.require('desktop-utils');
		this.dataDir = this.desktopUtils.getLocalDataDir('my-todays-all');
		// this.dataDir = remote.require('path').resolve('./tests/data');//開発中
		console.log(this.dataDir);

		this.settings = new (require('./settings.js'))(this);

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

	main.dbh = new (require(__dirname+'/dbh.js'))(main, function(){
		callback(main);
	})

	return;
}
