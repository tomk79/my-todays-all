/**
 * initialize
 */
module.exports = function( main, callback ){
	var _this = this;
	var remote = require('remote');
	var utils79 = require('utils79');
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
			'authinfo': utils79.base64_encode(JSON.stringify(authinfo))
		});
		// console.log(hdl);
		callback(hdl);
		return;
	} // addAccount()

	/**
	 * アカウント情報を更新する
	 */
	this.updateAccount = function(accountId, service, account, authinfo, callback){
		callback = callback || function(){};

		this.tbls.accounts
			.findOne({'where':{'id': accountId}})
			.then(function(result) {
				result.update({
					'service': service,
					'account': account,
					'authinfo': utils79.base64_encode(JSON.stringify(authinfo))
				});
				// console.log(result);
				callback(result);
			})
		;
		return;
	} // updateAccount()

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

	/**
	 * アカウント情報を削除する
	 */
	this.deleteAccount = function(accountId, callback){
		callback = callback || function(){};

		this.tbls.accounts
			.destroy({'where':{'id': accountId}})
			.then(function(result) {
				// console.log(result);
				callback(result);
			})
		;
		return;
	} // deleteAccount()


	/**
	 * アカウント情報を得る
	 */
	this.getAccount = function(accountId, callback){
		// console.log('get account: '+accountId);
		this.tbls.accounts
			.findOne({'where':{'id': accountId}})
			.then(function(result) {
				result = JSON.parse(JSON.stringify(result));
				try {
					result.authinfo = JSON.parse(utils79.base64_decode(result.authinfo));
				} catch (e) {
				}
				// console.log(result);
				callback(result);
			})
		;
		return;
	} // getAccount()

	callback();
	return;
}
