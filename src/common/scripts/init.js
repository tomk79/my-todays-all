/**
 * initialize
 */
module.exports = function( main, callback ){
	var remote = require('remote');
	var fs = remote.require('fs');

	main.desktopUtils = remote.require('desktop-utils');
	main.dataDir = main.desktopUtils.getLocalDataDir('my-todays-all');
	// main.dataDir = remote.require('path').resolve('./tests/data');//開発中
	console.log(main.dataDir);

	var timerWinResize;

	$(window)
		.load(function(){
			$('paper-tabs')
				.bind('iron-select', function(e){
					// console.log('selected!');
					// console.log(e);
					var $selected = $(this).find('paper-tab.iron-selected');
					// console.log($selected.attr('data-tab-name'));
					$('[data-tab-content]').hide(0, function(){
						setTimeout(function(){
							$('[data-tab-content='+$selected.attr('data-tab-name')+']').show(0);
						}, 10);
					});
				})
			;

		})
		.resize(function(){
			clearTimeout(timerWinResize);
			timerWinResize = setTimeout(function(){
				main.today.redraw();
			}, 500);
		})
	;

	(function () {
		// menubar セットアップ
		var electron = remote.require('electron');
		var Menu = electron.Menu;
		var mainWindow = window.main.currentWindow;
		// return;

		// if (process.platform == 'darwin') {
		// var name = require('electron').app.getName();

		var menu;
		if (process.platform == 'darwin') {
			menu = Menu.buildFromTemplate([
				{
					label: 'Electron',
					submenu: [
						{
							label: 'Quit',
							accelerator: 'Command+Q',
							click: function () {
								window.close();
								// app.quit();
							}
						},
					]
				},
				{
					label: "Application",
					submenu: [
						{ label: "About Application", selector: "orderFrontStandardAboutPanel:" },
						{ type: "separator" },
						{ label: "Quit",
							accelerator: "Command+Q",
							click: function () {
								window.close();
								// app.quit();
							}
						}
					]
				},
				{
					label: 'View',
					submenu: [
						{
							label: 'Reload',
							accelerator: 'Command+R',
							click: function () { mainWindow.restart(); }
						},
						{
							label: 'Toggle Full Screen',
							accelerator: 'Ctrl+Command+F',
							click: function () { mainWindow.setFullScreen(!mainWindow.isFullScreen()); }
						},
						{
							label: 'Toggle Developer Tools',
							accelerator: 'Alt+Command+I',
							click: function () { mainWindow.toggleDevTools(); }
						},
					]
				},
				{
					label: "Edit",
					submenu: [
						{ label: "Undo", accelerator: "Command+Z", selector: "undo:" },
						{ label: "Redo", accelerator: "Shift+Command+Z", selector: "redo:" },
						{ type: "separator" },
						{ label: "SelectAll", accelerator: "Command+A", selector: "selectall:" },
						{ label: "Cut", accelerator: "Command+X", selector: "cut:" },
						{ label: "Copy", accelerator: "Command+C", selector: "copy:" },
						{ label: "Paste", accelerator: "Command+V", selector: "paste:" }
					]
				}
			]);
			Menu.setApplicationMenu(menu);
		} else {
			menu = Menu.buildFromTemplate([
				{
					label: '&View',
					submenu: [
						{
							label: '&Reload',
							accelerator: 'Ctrl+R',
							click: function () { mainWindow.restart(); }
						},
						{
							label: 'Toggle &Full Screen',
							accelerator: 'F11',
							click: function () { mainWindow.setFullScreen(!mainWindow.isFullScreen()); }
						},
						{
							label: 'Toggle &Developer Tools',
							accelerator: 'Alt+Ctrl+I',
							click: function () { mainWindow.toggleDevTools(); }
						},
						{
							label: 'Toggle &Developer Tools',
							accelerator: 'F12',
							click: function () { mainWindow.toggleDevTools(); }
						},
					]
				}
			]);
			// mainWindow.setMenu(menu);
			Menu.setApplicationMenu(menu);
		}
	})();

	/**
	 * ローディング表示を開始する
	 */
	main.loadingStart = function(callback){
		callback = callback || function(){};
		$('#now-loading').get(0).open();
		callback();
	}

	/**
	 * ローディング表示を終了する
	 */
	main.loadingEnd = function(callback){
		callback = callback || function(){};
		$('#now-loading').get(0).close();
		callback();
	}


	main.settings = new (require('./settings.js'))(main);
	console.log('setting main.dbh');
	main.dbh = new (require(__dirname+'/dbh.js'))(main, function(){
		console.log('setting main.accountMgr');
		main.accountMgr = new (require('./accountMgr.js'))(main, function(){
			console.log('setting main.today');
			main.today = new (require('./today.js'))(main);
			callback(main);
		});
	})

	return;
}
