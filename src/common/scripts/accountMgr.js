module.exports = function(main, callback){
	var remote = require('remote');
	var accounts = {};
	var utils79 = require('utils79');
	var it79 = require('iterate79');
	var TimeslistApi = remote.require('timeslist-api-access');

	/**
	 * アカウント情報のモデル
	 */
	function Account(accountInfo){
		this.accountInfo = accountInfo;
		switch( this.accountInfo.service ){
			case 'timeslist':
				this.apiAgent = new TimeslistApi(this.accountInfo.account, this.accountInfo.authinfo.password);
				break;
		}
	}
	/**
	 * リモートサービスから情報を取得し、同期する
	 */
	Account.prototype.sync = function(callback){
		// console.log(this.apiAgent);
		switch( this.accountInfo.service ){
			case 'timeslist':
				this.apiAgent.fact(
					{},
					function(res, json, status, headers){
						// console.log(res);
						callback(res);
					}
				);
				break;
		}
		return;
	}

	/**
	 * すべてのアカウントを同期する
	 */
	this.syncAll = function(callback){
		it79.ary(
			accounts,
			function(it1, account, idx){
				console.log(account);
				account.sync(function(){
					it1.next();
				});
			},
			function(){
				console.log('syncAll done!');
				callback();
			}
		);
	}

	main.dbh.getAccountList(function(accountList){
		// console.log(accountList.rows);
		for(var idx in accountList.rows){
			var accountInfo = accountList.rows[idx];
			accountInfo.authinfo = JSON.parse( utils79.base64_decode(accountInfo.authinfo) );
			accounts[accountInfo.id] = new Account(accountInfo);
		}

		callback();
	});

	return;
}
