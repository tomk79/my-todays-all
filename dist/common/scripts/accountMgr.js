module.exports = function(main, callback){
	var remote = require('remote');
	var accounts = {};
	var utils79 = require('utils79');
	var it79 = require('iterate79');
	var TimeslistApi = remote.require('timeslist-api-access');
	// var BacklogApi = remote.require('backlog-api');

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
			case 'backlog':
				// this.apiAgent = BacklogApi(this.accountInfo.authinfo.space, this.accountInfo.account, this.accountInfo.authinfo.password);
				(require('./services/backlog.js'))(main, this);
				break;
		}

	}

	/**
	 * すべてのアカウントを同期する
	 */
	this.syncAll = function(callback){
		console.log('syncAll() start.');
		this.reloadAccounts(function(){
			it79.ary(
				accounts,
				function(it1, account, idx){
					var accountName = account.accountInfo.id + ' - ' + account.accountInfo.account + ' - ' + account.accountInfo.service
					console.log(accountName + ': start.');
					account.sync(function(){
						// console.log(account.apiAgent.accesskey);
						console.log('completed.');
						it1.next();
					});
				},
				function(){
					callback();
				}
			);
		});
	} // syncAll()

	/**
	 * アカウント情報を再読み込みする
	 */
	this.reloadAccounts = function(callback){
		accounts = {};
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
	} // reloadAccounts()

	this.reloadAccounts(function(){
		callback();
	});

	return;
}
