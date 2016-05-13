/**
 * dbh.js
 */
module.exports = function( main, callback ){
	var _this = this;
	var remote = require('remote');
	var utils79 = require('utils79');
	var unpackedPath = remote.require('./node/unpackedPath.js');
	var nodePhpBin = remote.require( unpackedPath('node_modules/node-php-bin/') ).get();
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
	 * クエリを実行する
	 */
	this.query = function(query, callback){
		callback = callback || function(){};
		// console.log(__dirname);
		var arg = [];
		arg.push( unpackedPath('php/db.php') );
		arg.push('--db');
		arg.push(main.dataDir+'/db.sqlite');
		// arg.push(utils79.base64_encode(JSON.stringify(query)));
		arg.push(JSON.stringify(query));
		// console.log(arg);

		// PHPスクリプトを実行する
		nodePhpBin.script(
			arg,
			function(data, error, code){
				// console.log(data, error, code);
				if(error){
					callback(false, error, 'FATAL ERROR');
					return;
				}
				try {
					data = JSON.parse(data);
				} catch (e) {
					callback(false, 1, 'JSON parse error');
					return;
				}
				// console.log(data.data);
				callback(data.data, data.error, data.message);
				return;
			}
		);
		return;
	}

	/**
	 * アカウント情報を追加する
	 */
	this.addAccount = function(service, account, authinfo, callback){
		callback = callback || function(){};

		// console.log(service, account, authinfo);
		this.query({
			'method':'addAccount',
			'service': service,
			'account': account,
			'authinfo': authinfo
		}, function(rows, err, message){
			callback(rows);
		});

		return;
	} // addAccount()

	/**
	 * アカウント情報を更新する
	 */
	this.updateAccount = function(accountId, service, account, authinfo, callback){
		callback = callback || function(){};

		this.query({
			'method':'updateAccount',
			'account_id': accountId,
			'service': service,
			'account': account,
			'authinfo': authinfo
		}, function(rows, err, message){
			callback(rows);
		});

		return;
	} // updateAccount()

	/**
	 * アカウント情報の一覧を取得する
	 */
	this.getAccountList = function(callback){
		console.log('main.dbh.getAccountList() start;');
		this.query({'method':'getAccountList'}, function(rows, err, message){
			rows = JSON.parse(JSON.stringify(rows));
			var rtn = {
				'count': rows.length,
				'rows': rows
			};
			// console.log(rtn.count);
			// console.log(rtn.rows);
			callback(rtn);
		});
		return;
	} // getAccountList()

	/**
	 * アカウント情報を削除する
	 */
	this.deleteAccount = function(accountId, callback){
		callback = callback || function(){};
		var _this = this;

		this.query({
			'method':'deleteAccount',
			'account_id': accountId
		}, function(result, err, message){
			_this.deleteRecordsOfAccount(accountId, function(result){
				callback(result);
			});
		});
		return;
	} // deleteAccount()


	/**
	 * アカウント情報を得る
	 */
	this.getAccount = function(accountId, callback){
		console.log('get account: '+accountId);
		this.query({
			'method':'getAccount',
			'account_id': accountId
		}, function(result, err, message){
			console.log(result);
			callback(result);
		});
		return;
	} // getAccount()


	/**
	 * レコードを更新する
	 */
	this.updateRecord = function( accountId, remote_id, uri, label, status, recordInfo, callback ){
		// console.log(accountId);
		// callback();return;
		this.query({
			'method':'updateRecord',
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
		}, function(result, err, message){
			callback(result);
		});

		return;
	} // updateRecord()

	/**
	 * 特定アカウントのレコードをすべて削除する
	 */
	this.deleteRecordsOfAccount = function( accountId, callback ){
		// console.log('deleteRecordsOfAccount');
		// console.log(accountId);
		this.query({
			'method':'deleteRecordsOfAccount',
			'account_id': accountId
		}, function(result, err, message){
			callback(result);
		});
		return;
	}

	/**
	 * レコード一覧を取得する
	 */
	this.getRecordList = function( callback ){
		console.log('main.dbh.getRecordList() start;');
		this.query({'method':'getRecordList'}, function(rows, err, message){
			rows = JSON.parse(JSON.stringify(rows));
			var rtn = {
				'count': rows.length,
				'rows': rows
			};
			// console.log(rtn.count);
			// console.log(rtn.rows);
			callback(rtn);
		});
		return;
	}

	setTimeout(function(){
		callback();
	}, 0);
	return;
}
