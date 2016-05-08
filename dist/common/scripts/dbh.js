/**
 * initialize
 */
module.exports = function( main, callback ){
	var _this = this;
	var remote = require('remote');
	var fs = remote.require('fs');
	var Sequelize = remote.require('sequelize');
	var sqlite = remote.require('sqlite3');

	try {
		fs.mkdirSync(main.dataDir);
	} catch (e) {
	}
	var dbPath = remote.require('path').resolve(main.dataDir, 'db.sqlite');
	console.log("DB Path: " + dbPath);
	this.sequelize = new Sequelize(undefined, undefined, undefined, {
		dialect: 'sqlite',
		connection: new sqlite.Database( dbPath ),
		storage: dbPath
	});

	this.tbls = {};
	this.tbls.accounts = this.sequelize.define('accounts',
		{
			'service': { type: Sequelize.STRING },
			'account': { type: Sequelize.STRING },
			'authinfo': { type: Sequelize.STRING }
		}
	);
	this.sequelize.sync();
	console.log(this.tbls);


	/**
	 * アカウント情報を追加する
	 */
	this.addAccount = function(service, account, authinfo, callback){
		callback = callback || function(){};

		// console.log(service, account, authinfo);

		var hdl = this.tbls.accounts.create({
			'service': service,
			'account': account,
			'authinfo': JSON.stringify(authinfo)
		});
		// console.log(hdl);
		callback(hdl);
		return;
	} // addAccount()

	/**
	 * アカウント情報の一覧を取得する
	 */
	this.getAccountList = function(callback){
		this.tbls.accounts
			.findAndCountAll({})
			.then(function(result) {
				result.rows = JSON.parse(JSON.stringify(result.rows));
				// console.log(result.count);
				// console.log(result.rows);
				callback(result);
			})
		;
		return;
	} // getAccountList()


	callback();
	return;
}
