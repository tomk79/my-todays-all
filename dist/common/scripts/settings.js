module.exports = function(main){

	// セッティングダイアログ
	var elmSettings = document.getElementById('settings');
	elmSettings.addEventListener('iron-overlay-opened', function(){
		// console.log('settings opened.');
	});
	elmSettings.addEventListener('iron-overlay-closed', function(){
		// console.log('settings closed.');
	});
	elmSettings.addEventListener('iron-overlay-canceled', function(){
		// console.log('settings canceled.');
	});

	// アカウント編集ダイアログ
	var elmEditAccount = document.getElementById('edit-account');
	// elmEditAccount.addEventListener('iron-overlay-opened', function(){
	// 	console.log('edit-account opened.');
	// });
	// elmEditAccount.addEventListener('iron-overlay-closed', function(){
	// 	console.log('edit-account closed.');
	// });
	// elmEditAccount.addEventListener('iron-overlay-canceled', function(){
	// 	console.log('edit-account canceled.');
	// });
	elmEditAccount.querySelector('paper-button[dialog-dismiss]').addEventListener('click', function(){
		// console.log('paper-button[dialog-dismiss] clicked.');
		elmEditAccount.cancel();
		elmSettings.open();
	});
	elmEditAccount.querySelector('paper-button[dialog-confirm]').addEventListener('click', function(){
		var service = elmEditAccount.querySelector('paper-dropdown-menu[name=service]').selectedItem.attributes.value.value;
		var account = elmEditAccount.querySelector('paper-input[name=account]').value;
		var password = elmEditAccount.querySelector('paper-input[name=password]').value;
		console.log(service, account, password);
		setTimeout(function(){
			elmSettings.open();
		}, 10);
	});
	// elmEditAccount.querySelector('paper-dropdown-menu').addEventListener('iron-select', function(e){
	// 	// console.log('paper-dropdown-menu -> iron-select');
	// 	e.stopPropagation();
	// 	e.preventDefault();
	// 	// elmEditAccount.querySelector('paper-dropdown-menu').close();
	// });
	// elmEditAccount.querySelector('paper-dropdown-menu paper-listbox').addEventListener('iron-select', function(e){
	// 	console.log('paper-listbox -> iron-select');
	// 	// e.stopPropagation();
	// 	// e.preventDefault();
	// 	// elmEditAccount.querySelector('paper-dropdown-menu').close();
	// });


	/**
	 * セッティングダイアログを開く
	 */
	this.open = function(){
		elmSettings.open();
		elmSettings.querySelector('iron-list').items = [
			{
				"name": "item1",
				"longText": "long text."
			} ,
			{
				"name": "item2",
				"longText": "long text."
			} ,
			{
				"name": "item3",
				"longText": "long text."
			} ,
			{
				"name": "item4",
				"longText": "long text."
			} ,
			{
				"name": "item5",
				"longText": "long text."
			}
		];
		setTimeout(function(){
			elmSettings.fit();
		}, 150);
	}

	/**
	 * アカウント情報の編集 または 追加
	 */
	this.editAccount = function(accountId){
		elmSettings.close();
		elmEditAccount.querySelector('paper-dropdown-menu paper-listbox').select();
		elmEditAccount.querySelector('paper-input[name=account]').value = '';
		elmEditAccount.querySelector('paper-input[name=password]').value = '';
		elmEditAccount.open();
	}

}
