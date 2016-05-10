/**
 * initialize
 */
module.exports = function( main, callback ){
	var remote = require('remote');
	var fs = remote.require('fs');

	main.desktopUtils = remote.require('desktop-utils');
	main.dataDir = main.desktopUtils.getLocalDataDir('my-todays-all');
	// main.dataDir = remote.require('path').resolve('./tests/data');//開発中
	console.log(main.dataDir);

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

	main.settings = new (require('./settings.js'))(main);
	main.dbh = new (require(__dirname+'/dbh.js'))(main, function(){
		main.accountMgr = new (require('./accountMgr.js'))(main, function(){
			main.today = new (require('./today.js'))(main);
			callback(main);
		});
	})

	return;
}
