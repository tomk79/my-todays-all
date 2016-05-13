/**
 * initialize
 */
module.exports = function( main, callback ){
	var _this = this;
	var remote = require('remote');
	var utils79 = require('utils79');
	var unpackedPath = remote.require('./node/unpackedPath.js');
	var fs = remote.require('fs');
	var Sequelize = remote.require(unpackedPath('node_modules/sequelize'));
	var sqlite = remote.require(unpackedPath('node_modules/sqlite3'));

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
			'service': { type: Sequelize.STRING() },
			'account': { type: Sequelize.STRING() },
			'authinfo': { type: Sequelize.TEXT() }
		}
	);
	this.tbls.records = this.sequelize.define('records',
		{
			'remote_id': { type: Sequelize.STRING(), primaryKey: true },
			'account_id': { type: Sequelize.INTEGER(), references: {
				model: this.tbls.accounts,
				key: 'id'
			} },
			'label': { type: Sequelize.TEXT() },
			'description': { type: Sequelize.TEXT() },
			'uri': { type: Sequelize.TEXT() },
			'phase_name': { type: Sequelize.TEXT() },
			'category_name': { type: Sequelize.TEXT() },
			'assigned_user_name': { type: Sequelize.STRING() },
			'posted_user_name': { type: Sequelize.STRING() },
			'status_name': { type: Sequelize.STRING() },
			'status': { type: Sequelize.INTEGER() },
			'start_datetime': { type: Sequelize.DATE() },
			'end_datetime': { type: Sequelize.DATE() }
		}
	);
	this.sequelize.sync();
	// console.log(this.tbls);


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
		console.log('main.dbh.getAccountList() start;');
		this.tbls.accounts
			.findAndCountAll({})
			.then(function(result) {
				result.rows = JSON.parse(JSON.stringify(result.rows));
				console.log(result.count);
				console.log(result.rows);
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
		var _this = this;

		this.tbls.records
			.destroy({'where':{'account_id': accountId}})
			.then(function(result) {
				// console.log(result);
				_this.tbls.accounts
					.destroy({'where':{'id': accountId}})
					.then(function(result) {
						// console.log(result);
						callback(result);
					})
				;
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


	/**
	 * レコードを更新する
	 */
	this.updateRecord = function( accountId, remote_id, uri, label, status, recordInfo, callback ){
		// console.log(accountId);
		// callback();return;
		this.tbls.records
			.findOne({'where':{
				'account_id': accountId,
				'remote_id': remote_id,
				'uri': uri
			}})
			.then(function(result) {
				// console.log(result);
				var data = {
					'account_id': accountId,
					'remote_id': remote_id,
					'uri': uri,
					'label': label,
					'status': status,
					'status_name': recordInfo.status_name,
					'phase_name': recordInfo.phase_name,
					'category_name': recordInfo.category_name,
					'assigned_user_name': recordInfo.assigned_user_name,
					'posted_user_name': recordInfo.posted_user_name,
					'start_datetime': recordInfo.start_datetime,
					'end_datetime': recordInfo.end_datetime
				};
				if(result === null){
					_this.tbls.records.create(data);
				}else{
					result.update(data);
				}
				callback();
			})
		;
		return;
	} // updateRecord()

	/**
	 * 特定アカウントのレコードをすべて削除する
	 */
	this.deleteRecordsOfAccount = function( accountId, callback ){
		// console.log('deleteRecordsOfAccount');
		// console.log(accountId);
		this.tbls.records
			.destroy({'where':{'account_id': accountId}})
			.then(function(result) {
				// console.log(result);
				callback(result);
			})
		;
		return;
	}

	/**
	 * レコード一覧を取得する
	 */
	this.getRecordList = function( callback ){
		this.tbls.records
			.findAndCountAll({
				'where':{
					'status': 1
				},
				'order': 'end_datetime' // 締切が近い順
			})
			.then(function(result) {
				result.rows = JSON.parse(JSON.stringify(result.rows));
				// console.log(result.count);
				// console.log(result.rows);
				callback(result);
			})
		;
		return;
	}

	setTimeout(function(){
		callback();
	}, 0);
	return;
}
