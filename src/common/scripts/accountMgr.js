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
		this.sync = function(callback){
			callback();
		}
		switch( this.accountInfo.service ){
			case 'timeslist':
				this.apiAgent = new TimeslistApi(this.accountInfo.account, this.accountInfo.authinfo.password);
				(require('./services/timeslist.js'))(main, this);
				break;
		}

	}

	/**
	 * すべてのアカウントを同期する
	 */
	this.syncAll = function(callback){
		it79.ary(
			accounts,
			function(it1, account, idx){
				account.sync(function(){
					// console.log(account.apiAgent.accesskey);
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
			// console.log(accountInfo);
			accountInfo.authinfo = JSON.parse( utils79.base64_decode(accountInfo.authinfo) );
			accounts[accountInfo.id] = new Account(accountInfo);
		}
		// console.log(accounts);
		callback();
	});

	return;
}
