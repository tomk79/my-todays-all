/**
 * backlog.js
 */
module.exports = function(main, accountMgr){
	var remote = require('remote');
	var accounts = {};
	var utils79 = require('utils79');
	var it79 = require('iterate79');

	/**
	 * リモートサービスから情報を取得し、同期する
	 */
	accountMgr.sync = function(callback){
		// console.log(this.apiAgent);
		var _this = this;

		this.apiAgent.getProjects(function(err, projects) {
			console.log(err);
			console.log(projects);
			callback();

		});
	}

	return;
}
