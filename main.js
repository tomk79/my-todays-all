'use strict';

// Module to control application life.
// アプリケーションをコントロールするモジュール
var app = require('app');

// Module to create native browser window.
// ウィンドウを作成するモジュール
var BrowserWindow = require('browser-window');
// Report crashes to our server.
require('crash-reporter').start();


// メインウィンドウはGCされないようにグローバル宣言
var mainWindow;

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function() {
	app.quit();
});

var electron = require('electron');
var Menu = electron.Menu;

var installMenu = function () {
	// 開発者ツール
	// mainWindow.toggleDevTools();

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
						click: function () { app.quit(); }
					},
				]
			},
			{
				label: "Application",
				submenu: [
					{ label: "About Application", selector: "orderFrontStandardAboutPanel:" },
					{ type: "separator" },
					{ label: "Quit", accelerator: "Command+Q", click: function () { app.quit(); } }
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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
	// Create the browser window.
	mainWindow = new BrowserWindow({ width: 440, height: 370 });
	// and load the index.html of the app.
	mainWindow.loadUrl('file://' + __dirname + '/dist/index.html');


	try {
		installMenu();
	} catch (e) {
		console.log(e);
	}

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});

	//  mainWindow.toggleDevTools();

});

// Quit when all windows are closed.
// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform != 'darwin') {
		app.quit();
	}
});
