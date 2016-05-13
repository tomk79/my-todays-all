/**
 * timeslist.js
 */
module.exports = function(main, accountMgr){
	var remote = require('remote');
	var accounts = {};
	var utils79 = require('utils79');
	var it79 = require('iterate79');

	/**
	 * 日付形式をパースする
	 */
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

	/**
	 * リモートサービスから情報を取得し、同期する
	 */
	accountMgr.sync = function(callback){
		callback = callback || function(){};
		// console.log(this.apiAgent);
		var _this = this;

		this.apiAgent.fact(
			{},
			function(res, json, status, headers){
				// console.log(res);
				// console.log(status);
				if( res === false ){
					callback();
					return;
				}

				main.dbh.deleteRecordsOfAccount(_this.accountInfo.id, function(){
					it79.ary(
						res,
						function(it1, row, idx){
							// console.log(JSON.parse(JSON.stringify(row)));
							// console.log(_this.accountInfo);

							main.dbh.updateRecord(
								_this.accountInfo.id, // account_id
								_this.accountInfo.id+':'+_this.accountInfo.service+':project_no='+row.project_no+':fact_no='+row.fact_no, // remote_id
								'https://timeslist.com/WTL0200/input/a/'+row.fact_post_user_no+'/p/'+row.project_id+'/f/'+row.fact_no+'/disp/bs/', // url
								row.fact_title, // label
								(row.fact_type_status_no==20 ? 0 : 1), // status
								{
									'category_name': row.fact_category_name,
									'status_name': row.fact_type_status_name,
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
				});
			}
		);
		return;
	}

	return;
}
