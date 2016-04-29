(function(window){
	var $ = window.$ = require('jquery');
	var remote = require('remote');
	var diffdir = remote.require('./node/diffdir.js');
	var dialog = remote.require('dialog');
	var browserWindow = remote.require('browser-window');
	// console.log(diffdir);

	window.main = new (function(){
		this.executeDiffdir = function(form){
			var $form = $(form);
			var dd = new diffdir(
				$form.find('input[name=before]').val() ,
				$form.find('input[name=after]').val() ,
				{
					'-o': $form.find('input[name=output]').val() ,
					'--strip-crlf': $form.find('input[name=strip-crlf]:checked').val()
				}
			);
			$('input,button').attr({
				'disabled': 'disabled'
			});
			dd.execute(function(data, error, code){
				alert('fin.');
				$('input,button').removeAttr('disabled');
			});
		}


	})();

	$(window).load(function(){
		$('.select-local-directory').on('click', function(){
			var $inputFor = $($(this).attr('data-for'));
			var focusedWindow = browserWindow.getFocusedWindow();
			dialog.showOpenDialog(focusedWindow, {
				properties: ['openDirectory']
			}, function(directories){
				directories.forEach(function(directory){
					$inputFor.val(directory);
					// console.log(directory);
				});
			});
		});

	});

})(window);
