/**
 * Today
 */
module.exports = function(main){
	var remote = require('remote');

	this.update = function(){
		main.accountMgr.syncAll(function(){
			console.info('Standby!!');
		});
	}
}
