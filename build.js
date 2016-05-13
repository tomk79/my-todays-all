/**
 * $ node build.js
 */
var packager = require('electron-packager');
var config = require('./package.json');
var zipFolder = require('zip-folder');
var rimraf = require('rimraf');

function build( condition, callback ){
	var dir = './';
	var out = './build';
	var name = config.name;

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

	var version = '0.36.1';
	var app_bundle_id = 'jp.pxt.www'; //<- 自分のドメインなどを使用してください
	var helper_bundle_id = 'jp.pxt.www'; //<- 自分のドメインなどを使用してください

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
	var npm_ignore = [], ignores;
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
			overwrite: true,
			// asar: false,
			asar: true, // aserに固める
			"asar-unpack-dir": "unpacked",
			prune: true,
			ignore: 'node_modules/(' + ignores + '|\.bin)|build|build\.js|tests|src|submodules|materials|gulpfile.js|bower.json|.bowerrc',
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

build({'platform':'darwin','arch':'x64'}, function(){
build({'platform':'win32','arch':'x64'}, function(){
build({'platform':'win32','arch':'ia32'}, function(){
	console.log('ALL DONE!');
});
});
});
