/**
 * build.js
 */
var packager = require('electron-packager');
var zipFolder = require('zip-folder');
var rimraf = require('rimraf');
var utils79 = require('utils79');
var Promise = require('es6-promise').Promise;

var config = require('./package.json');
var dir = './';
var out = './build';
var name = config.name;

console.log('== build "'+name+'" ==');

/**
 * クリーニング
 */
function cleanup(callback){
	callback = callback || function(){};
	var fsX = require('fs-extra');

	var ls = require('fs').readdirSync(out);
	for(var idx in ls){
		if( ls[idx] == '.gitkeep' ){continue;}
		if( utils79.is_dir(out+'/'+ls[idx]) ){
			console.log('dir: '+ls[idx]);
			fsX.removeSync(out+'/'+ls[idx]);
		}else if( utils79.is_file(out+'/'+ls[idx]) ){
			console.log('file: '+ls[idx]);
			fsX.removeSync(out+'/'+ls[idx]);
		}
	}

	callback();
	return;
}

/**
 * ビルド
 */
function build( condition, callback ){
	callback = callback || function(){};
	var platform = condition.platform;
	var arch = condition.arch;

	var isWin = (platform=='win32' ? true : false);
	if (platform == 'win32') {
		console.log('Build Target -> Windows');
	} else if (platform == 'darwin') {
		console.log('Build Target -> Mac');
	} else {
		console.log('Build Target -> Unknown');
	}

	var icon = './resources/app.icns'; //<- アプリアイコン
	if (isWin) {
		icon = './resources/app_for_Windows.ico'; //<- アプリアイコン
	}

	var version = '1.4.1';
	var app_bundle_id = 'jp.pxt.applications.my-todays-all'; //<- 自分のドメインなどを使用してください
	var helper_bundle_id = 'jp.pxt.applications.my-todays-all'; //<- 自分のドメインなどを使用してください

	var zip = function (relativePath, relativeZipPath, cb) {
		zipFolder(
			__dirname + '/' + relativePath + '/',
			__dirname + '/' + relativeZipPath + '.zip',
			function (err) {
				if (err) {
					console.log('zip ERROR!', err);
				} else {
					rimraf('./' + relativePath, function () {
						// Something
						console.log('zip SUCCESS!.');
						cb();
					});

				}
			}
		);
	}
	var npm_ignore = [],
	    ignores;
	for (var key in config.devDependencies) {
		npm_ignore.push(key);
	}
	ignores = npm_ignore.join('|');

	console.time("build-time");
	packager(
		{
			"dir": dir,
			"out": out,
			"name": name,
			"platform": platform,
			"arch": arch,
			"version": version,
			"icon": icon,
			'app-bundle-id': app_bundle_id,
			'app-version': config.version,
			'helper-bundle-id': helper_bundle_id,
			"overwrite": true,
			// "asar": false,
			"asar": true, // aserに固める
			"asar-unpack-dir": "unpacked",
			"prune": true,
			"ignore": 'node_modules/(' + ignores + '|\.bin)|build|build\.js|tests|src|submodules|materials|gulpfile.js|bower.json|.bowerrc',
			'version-string': {
				CompanyName: 'tomk79',
				FileDescription: config.description,
				OriginalFilename: config.name,
				FileVersion: config.version,
				ProductVersion: config.version,
				ProductName: config.name,
				InternalName: config.name
			}
		}, function done(err, appPath) {
			if (err) {
				throw new Error(err);
			}
			console.log('appPath', appPath);

			var zipPath = './build/'+config.name+'-'+config.version+'-'+platform+'-'+arch;

			zip(appPath, zipPath, function () {
				console.timeEnd("build-time");
				console.log('Done!!');
				callback();
			});
		}
	);
}



new Promise(function(rlv){rlv();})
	.then(function(){ return new Promise(function(rlv, rjt){
		console.log('--- cleanup ---');
		cleanup(function(){
			console.log('done.');
			console.log('');
			rlv();
		});
	}); })
	.then(function(){ return new Promise(function(rlv, rjt){
		console.log('--- Building for Darwin x64 ---');
		build({'platform':'darwin','arch':'x64'}, function(){
			console.log('done.');
			console.log('');
			rlv();
		});
	}); })
	.then(function(){ return new Promise(function(rlv, rjt){
		console.log('--- Building for Win32 x64 ---');
		build({'platform':'win32','arch':'x64'}, function(){
			console.log('done.');
			console.log('');
			rlv();
		});
	}); })
	.then(function(){ return new Promise(function(rlv, rjt){
		console.log('--- Building for Win32 ia32 ---');
		build({'platform':'win32','arch':'ia32'}, function(){
			console.log('done.');
			console.log('');
			rlv();
		});
	}); })
	.then(function(){ return new Promise(function(rlv, rjt){
		console.log('ALL DONE!');
	}); })
;
