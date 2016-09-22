'use strict';

// Module to control application life.
// アプリケーションをコントロールするモジュール
const electron = require('electron');
const {app, BrowserWindow, crashReporter, Menu} = require('electron');

// crashReporter セッティング
crashReporter.start({
	productName: 'Today',
	companyName: 'Tomoya Koyanagi',
	submitURL: 'https://github.com/tomk79/my-todays-all/issues',
	autoSubmit: false
});

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function() {
	app.quit();
});

let mainWindow;


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
	// Create the browser window.
	mainWindow = new BrowserWindow({ width: 840, height: 540 });

	// and load the index.html of the app.
	mainWindow.loadURL('file://' + __dirname + '/dist/index.html');

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
