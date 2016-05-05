/**
 * initialize
 */
module.exports = function( callback ){
	var remote = require('remote');
	var fs = remote.require('fs');
	var Sequelize = remote.require('sequelize');
	var sqlite = remote.require('sqlite3');

	var main = new (function(){
		var _this = this;
		this.desktopUtils = remote.require('desktop-utils');
		this.dataDir = this.desktopUtils.getLocalDataDir('my-todays-all');
		// console.log(this.dataDir);

		try {
			fs.mkdirSync(this.dataDir);
		} catch (e) {
		}
		var dbPath = remote.require('path').resolve(this.dataDir, 'db.sqlite');
		console.log("DB Path: " + dbPath);
		this.sequelize = new Sequelize(undefined, undefined, undefined, {
			dialect: 'sqlite',
			connection: new sqlite.Database( dbPath ),
			storage: dbPath
		});

		this.tbls = {};
		this.tbls.accounts = this.sequelize.define('accounts',
			{
				service: { type: Sequelize.STRING },
				account: { type: Sequelize.STRING },
				authinfo: { type: Sequelize.STRING }
			}
		);
		this.sequelize.sync();
		console.log(this.tbls);

		_this.settings = new (require('./settings.js'))(this);


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

	callback(main);


}
