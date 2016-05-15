/**
 * backlog.js
 */
module.exports = function(main, accountMgr){
	var remote = require('remote');
	var accounts = {};
	var utils79 = require('utils79');
	var it79 = require('iterate79');
	var $ = require('jquery');

	/**
	 * リモートサービスから情報を取得し、同期する
	 */
	accountMgr.sync = function(callback){
		// console.log(this.apiAgent);
		var _this = this;
		var authInfo = {};
		authInfo.space = this.accountInfo.authinfo.space;
		authInfo.apiKey = this.accountInfo.authinfo.password;

		apiAccess('/users/myself', authInfo, {}, function(userInfo) {
			// console.log(userInfo);
			apiAccess('/issues', authInfo, {
				'assigneeId': [userInfo.id],
				'count': 100
			}, function(issues) {
				// console.log(issues);
				if( issues === false ){
					callback();
					return;
				}

				main.dbh.deleteRecordsOfAccount(_this.accountInfo.id, function(){
					it79.ary(
						issues,
						function(it1, row, idx){
							// console.log(JSON.parse(JSON.stringify(row)));
							// console.log(_this.accountInfo);
							main.dbh.updateRecord(
								_this.accountInfo.id, // account_id
								_this.accountInfo.id+':'+_this.accountInfo.service+':projectId='+row.projectId+':issueKey='+row.issueKey, // remote_id
								'https://'+_this.accountInfo.authinfo.space+'.backlog.jp/view/'+row.issueKey, // url
								row.summary, // label
								(row.status.id==4 ? 0 : 1), // status
								{
									'category_name': (function(row){
										if(!row.category.length){return '';}
										return row.category[0].name;
									})(row),
									'status_name': row.status.name,
									'phase_name': (function(row){
										if(!row.milestone.length){return '';}
										return row.milestone[0].name;
									})(row),
									'assigned_user_name': row.assignee.name,
									'posted_user_name': row.createdUser.name,
									'start_datetime': row.updated,
									'end_datetime': row.dueDate
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

			});
		});
	}

	function apiAccess( api, authInfo, data, callback ){
		data.apiKey = authInfo.apiKey;
		// console.log(data);
		var type = 'GET';

		switch(api){
			case '/users/myself':
			case '/issues':
				type = 'GET';
				break;
		}

		var rtn = {};
		$.ajax({
			'url': 'https://'+authInfo.space+'.backlog.jp/api/v2'+api,
			'data': data,
			'type': type,
			'dataType': 'json',
			'success': function(data){
				// console.log(data);
				rtn = data;
			},
			'error': function(err){
				// console.log(err);
				rtn = false;
			},
			'complete': function(data, dataType){
				// console.log(data);
				// console.log(dataType);
				callback(rtn);
			}
		});
	}

	return;
}
