/**
 * unpackedPath.js
 */
(function(module){
	delete(require.cache[require('path').resolve(__filename)]);
	var path = require('path');
	var fs = require('fs');

	/**
	 * getting path to unpacked resource
	 */
	module.exports = function(pathLocal){
		var rootDir = __dirname + '/../unpacked/';
		if( __dirname.match(new RegExp('(?:\\/|\\\\)app\\.asar(?:\\/|\\\\)')) ){ // ビルド後の場合
			rootDir = __dirname + '/../../app.asar.unpacked/unpacked/';
		}

		var rtn = path.resolve(rootDir + pathLocal);
		// console.log(rtn);
		return rtn;
	}

})(module);
