(function(window){
	var $ = window.$ = require('jquery');
	var _this = this;
	var remote = require('remote');
	// var dialog = remote.require('dialog');
	// var browserWindow = remote.require('browser-window');
	// console.log(diffdir);
	var init = require('./common/scripts/init.js');

	window.main = {};
	window.main.currentWindow = remote.getCurrentWindow();

	init(main, function(){
		main.today.refresh();
	});

})(window);
