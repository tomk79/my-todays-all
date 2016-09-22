'use strict';

/**
 * dbh.js
 */
module.exports = function( main, callback ){
	var _this = this;
	const {remote} = require('electron');
	var utils79 = require('utils79');
	var unpackedPath = remote.require('./node/unpackedPath.js');
	var nodePhpBin = remote.require( unpackedPath('node_modules/node-php-bin/') ).get();
	var fs = remote.require('fs');

	try {
		fs.mkdirSync(main.dataDir);
	} catch (e) {
	}
	var dbPath = remote.require('path').resolve(main.dataDir, 'db.sqlite');
	console.log("DB Path: " + dbPath);

	/**
	 * クエリを実行する
	 */
	this.query = function(query, callback){
		callback = callback || function(){};
		// console.log(__dirname);
		var arg = [];
		arg.push( unpackedPath('php/db.php') );
		arg.push('--db');
		arg.push( dbPath );
		arg.push(utils79.base64_encode(JSON.stringify(query)));
		// arg.push(JSON.stringify(query));
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
				// console.log(data.data, data.error, data.message);
				callback(data.data, data.error, data.message);
				return;
			}
		);
		return;
	}

	/**
	 * アカウント情報を追加する
	 */
	this.addAccount = function(service, account, authinfo, active_flg, callback){
		callback = callback || function(){};

		// console.log(service, account, authinfo);
		this.query({
			'method':'addAccount',
			'service': service,
			'account': account,
			'authinfo': authinfo,
			'active_flg': active_flg
		}, function(rows, err, message){
			callback(rows);
		});

		return;
	} // addAccount()

	/**
	 * アカウント情報を更新する
	 */
	this.updateAccount = function(accountId, service, account, authinfo, active_flg, callback){
		callback = callback || function(){};

		this.query({
			'method':'updateAccount',
			'account_id': accountId,
			'service': service,
			'account': account,
			'authinfo': authinfo,
			'active_flg': active_flg
		}, function(rows, err, message){
			callback(rows);
		});

		return;
	} // updateAccount()

	/**
	 * アカウント情報の一覧を取得する
	 */
	this.getAccountList = function(callback){
		// console.log('main.dbh.getAccountList() start;');
		this.query({'method':'getAccountList'}, function(rows, err, message){
			// console.log(rows);
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
		// console.log('get account: '+accountId);
		this.query({
			'method':'getAccount',
			'account_id': accountId
		}, function(result, err, message){
			// console.log(result);
			callback(result);
		});
		return;
	} // getAccount()


	/**
	 * レコードを更新する
	 */
	this.updateRecord = function( accountId, remote_id, service, uri, label, status, recordInfo, callback ){
		var queryData = {
			'method':'updateRecord',
			'account_id': accountId,
			'service': service,
			'remote_id': remote_id,
			'uri': uri,
			'label': label,
			'status': status,
			'status_name': recordInfo.status_name,
			'phase_name': recordInfo.phase_name,
			'category_name': recordInfo.category_name,
			'assigned_user_name': recordInfo.assigned_user_name,
			'posted_user_name': recordInfo.posted_user_name,
			'additional_info': recordInfo.additional_info,
			'start_datetime': recordInfo.start_datetime,
			'end_datetime': recordInfo.end_datetime
		};
		// console.log(queryData);
		this.query(queryData, function(result, err, message){
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
	this.getRecordList = function( account_id_list, callback ){
		// console.log('main.dbh.getRecordList() start;');
		// console.log(account_id_list);
		this.query({
			'method':'getRecordList',
			'account_id_list': account_id_list
		}, function(rows, err, message){
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

	this.query({
		'method':'initialize'
	}, function(rows, err, message){
		callback();
	});
	return;
}
