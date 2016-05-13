var gulp = require('gulp');
var sass = require('gulp-sass');//CSSコンパイラ
var copy = require('gulp-copy');//コピー機能
var autoprefixer = require("gulp-autoprefixer");//CSSにベンダープレフィックスを付与してくれる
var uglify = require("gulp-uglify");//JavaScriptファイルの圧縮ツール
var concat = require('gulp-concat');//ファイルの結合ツール
var plumber = require("gulp-plumber");//コンパイルエラーが起きても watch を抜けないようになる
var rename = require("gulp-rename");//ファイル名の置き換えを行う
var twig = require("gulp-twig");//Twigテンプレートエンジン
// var browserify = require("gulp-browserify");//NodeJSのコードをブラウザ向けコードに変換
var rimraf = require('rimraf');// The UNIX command `rm -rf` for node.
var packageJson = require(__dirname+'/package.json');
var _tasks = [
	'.html',
	'.html.twig',
	'.css',
	'.css.scss',
	'.js',
	'client-libs',
	'server-libs',
	'unpacked'
];


// client-libs (frontend) を処理
gulp.task("client-libs", function() {
	gulp.src(["node_modules/bootstrap/dist/**/*"])
		.pipe(gulp.dest( './dist/common/libs/bootstrap/dist/' ))
	;
});

// server-libs (backend) を処理
gulp.task("server-libs", function() {
	gulp.src(["resources/sqlite3/**/*"])
		.pipe(gulp.dest( './node_modules/sqlite3/' ))
	;
});

// unpackするリソースをコピーする
gulp.task('unpacked', function(){
	var unpackDependencies = [
		'sequelize',
		'sqlite3',

		'debug',
		'ms',
		'terraformer',
		'validator',
		'xmlbuilder',
		'xmlrpc',

		'wkx',
		'validator',
		// 'toposort-class',
		'terraformer-wkt-parser',
		'shimmer',
		'semver',
		'retry-as-promised',
		'node-uuid',
		'moment-timezone',
		'moment',
		'lodash',
		'inflection',
		'generic-pool',
		'dottie',
		'depd',
		'bluebird'
	];
	for(var i in unpackDependencies){
		var packageName = unpackDependencies[i];
		gulp.src('node_modules/'+packageName+'/**/*')
			.pipe(gulp.dest( './unpacked/node_modules/'+packageName+'/' ))
		;
	}
	gulp.src('node_modules/toposort-class/**/*')
		.pipe(gulp.dest( './unpacked/node_modules/toposort-class/' ))
		.on('end', function(){
			// ↓これをしないと、unpacked内で繋がらなくなる。なぜか。
			gulp.src('node_modules/toposort-class/build/toposort.js')
				.pipe(concat('index.js'))
				.pipe(gulp.dest( './unpacked/node_modules/toposort-class/' ))
			;
		})
	;
	// gulp.src("node_modules/node-php-bin/**/*")
	// 	.pipe(gulp.dest( "./unpacked/node_modules/node-php-bin" ))
	// ;
	// gulp.src("vendor/**/*")
	// 	.pipe(gulp.dest( "./unpacked/vendor" ))
	// ;
	// gulp.src("php/**/*")
	// 	.pipe(gulp.dest( "./unpacked/php" ))
	// ;
	// gulp.src(["composer.json","composer.lock"])
	// 	.pipe(gulp.dest( "./unpacked" ))
	// ;
});

// src 中の *.css.scss を処理
gulp.task('.css.scss', function(){
	gulp.src("src/**/*.css.scss")
		.pipe(plumber())
		.pipe(sass())
		// .pipe(autoprefixer())
		.pipe(rename({extname: ''}))
		.pipe(gulp.dest( "./dist/" ))
	;
});

// src 中の *.css を処理
gulp.task('.css', function(){
	gulp.src("src/**/*.css")
		.pipe(plumber())
		.pipe(gulp.dest( "./dist/" ))
	;
});

// *.js を処理
gulp.task(".js", function() {
	gulp.src(["src/**/*.js"])
		// .pipe(browserify({
		// }))
		.pipe(plumber())
		// .pipe(uglify())
		.pipe(gulp.dest( "./dist/" ))
	;
});

// *.html を処理
gulp.task(".html", function() {
	gulp.src(["src/**/*.html", "src/**/*.htm"])
		.pipe(plumber())
		.pipe(gulp.dest( "./dist/" ))
	;
});

// *.html.twig を処理
gulp.task(".html.twig", function() {
	gulp.src(["src/**/*.html.twig"])
		.pipe(plumber())
		.pipe(twig({
			data: {packageJson: packageJson}
		}))
		.pipe(rename({extname: ''}))
		.pipe(gulp.dest( "./dist/" ))
	;
});


// src 中のすべての拡張子を監視して処理
gulp.task("watch", function() {
	gulp.watch(["src/**/*"], _tasks);
});

// src 中のすべての拡張子を処理(default)
gulp.task("default", _tasks);
