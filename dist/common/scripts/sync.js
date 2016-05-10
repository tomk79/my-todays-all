module.exports = function(main){
	var remote = require('remote');
	var TimeslistApi = require('timeslist-api-access');

	this.auth = function(accountInfo, callback){
		if(accountInfo.service == 'timeslist'){
			var timeslistApi = new TimeslistApi(accountInfo.account, accountInfo.authinfo.password);
		}
	}

}
