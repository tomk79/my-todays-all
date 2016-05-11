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

		/**
		 * リモートサービスから情報を取得し、同期する
		 */
		this.sync = function(callback){
			// console.log(this.apiAgent);
			var _this = this;
			switch( this.accountInfo.service ){
				case 'timeslist':
					function parseDate(str,isEnd){
						if(str === null){ return null; }
						if(!str.length){ return null; }
						str.match(new RegExp('^([0-9]{4})([0-9]{2})([0-9]{2})$'));
						var y = RegExp.$1;
						var m = RegExp.$2;
						var d = RegExp.$3;
						// console.log(str);
						// console.log(y,m,d);
						var time = (isEnd ? '23:59:59' : '00:00:00');
						var date = new Date(y+'-'+m+'-'+d+' '+time);
						date = date.toISOString();
						return date;
					}
					this.apiAgent.fact(
						{},
						function(res, json, status, headers){
							// console.log(res);
							it79.ary(
								res,
								function(it1, row, idx){
									// console.log(JSON.parse(JSON.stringify(row)));
									// console.log(_this.accountInfo);
									main.dbh.updateRecord(
										_this.accountInfo.id, // account_id
										_this.accountInfo.service+':project_no='+row.project_no+':fact_no='+row.fact_no, // remote_id
										'https://timeslist.com/WTL0200/input/a/'+row.fact_post_user_no+'/p/'+row.project_id+'/f/'+row.fact_no+'/disp/bs/', // url
										row.fact_title, // label
										row.fact_type_status_name, // status
										{
											'category_name': row.fact_category_name,
											'phase_name': row.phase_name,
											'assigned_user_name': row.fact_user_name,
											'posted_user_name': row.fact_post_user_name,
											'start_datetime': parseDate(row.fact_start_date,false),
											'end_datetime': parseDate(row.fact_deadline,true)
										},
										function(){
											it1.next();
										}
									);
								},
								function(){
									callback();
								}
							);
						}
					);
					break;
			}
			return;
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
