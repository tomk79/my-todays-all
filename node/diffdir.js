/**
 * diffdir.js
 */
(function(module){
	// console.log(__dirname);
	// console.log(__filename);
	delete(require.cache[require('path').resolve(__filename)]);

	var uppath = require('./unpackedPath.js');

	module.exports = function(pathBefore, pathAfter, options){
		var _this = this;
		var nodePhpBin = require( uppath('node_modules/node-php-bin/') ).get();

		/**
		 * 処理の開始
		 */
		this.execute = function( callback ){
			callback = callback || function(){};

			// console.log(__dirname);
			var arg = [];
			arg.push( uppath('php/diffdir.php') );
			if( options['-o'] ){
				arg.push('-o');
				arg.push(options['-o']);
			}
			if(options['--strip-crlf']){
				arg.push('--strip-crlf');
			}
			arg.push(pathBefore);
			arg.push(pathAfter);
			console.log(arg);

			// PHPスクリプトを実行する
			nodePhpBin.script(
				arg,
				function(data, error, code){
					console.log(data, error, code);
					callback(data, error, code);
				}
			);
			return;
		}

		/**
		 * システムコマンドを実行する(spawn)
		 */
		this.spawn = function(cmd, cliOpts, opts){
			opts = opts||{};
			if( opts.cd ){
				process.chdir( opts.cd );
			}
			// console.log( opts.cd );
			// console.log( process.cwd() );

			var proc = require('child_process').spawn(cmd, cliOpts);
			if( opts.success ){ proc.stdout.on('data', opts.success); }
			if( opts.error ){ proc.stderr.on('data', opts.error); }
			if( opts.complete ){ proc.on('close', opts.complete); }

			if( opts.cd ){
				process.chdir( _pathCurrentDir );
			}
			// console.log( process.cwd() );

			return proc;
		}
	}


})(module);
