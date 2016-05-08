module.exports = function(main){
	var $ = require('jquery');
	var _this = this;

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

	/**
	 * セッティングダイアログを開く
	 */
	this.open = function(){
		elmSettings.open();
		main.dbh.getAccountList(function(list){
			console.log(list);
			elmSettings.querySelector('iron-list').items = list.rows;
			setTimeout(function(){
				elmSettings.fit();
				$(elmSettings).find('iron-list paper-item').dblclick(function(){
					var accountId = $(this).find('span').text();
					// console.log(accountId);
					_this.editAccount(accountId);
				});
			}, 150);
		});
	}


	// アカウント編集 または 追加 ダイアログ
	var elmEditAccount = document.getElementById('edit-account');
	elmEditAccount.querySelector('paper-button[dialog-dismiss]').addEventListener('click', function(){
		// console.log('paper-button[dialog-dismiss] clicked.');
		elmEditAccount.cancel();
		elmSettings.open();
	});
	elmEditAccount.querySelector('paper-button[dialog-confirm]').addEventListener('click', function(){
		var service = elmEditAccount.querySelector('paper-dropdown-menu[name=service]').selectedItem.attributes.value.value;
		var account = elmEditAccount.querySelector('paper-input[name=account]').value;
		var password = elmEditAccount.querySelector('paper-input[name=password]').value;
		var accountId = elmEditAccount.querySelector('input[name=account-id]').value;
		// console.log(service, account, password);
		if(accountId){
			main.dbh.updateAccount(accountId, service, account, {"password": password}, function(hdl){
				// console.log(hdl);
				_this.open();
			});
		}else{
			main.dbh.addAccount(service, account, {"password": password}, function(hdl){
				// console.log(hdl);
				_this.open();
			});
		}
		return;
	});


	/**
	 * アカウント情報の編集 または 追加 ダイアログを開く
	 */
	this.editAccount = function(accountId){
		elmSettings.close();
		elmEditAccount.querySelector('h1').innerHTML = 'Add Account';
		elmEditAccount.querySelector('input[name=account-id]').value = '';
		elmEditAccount.querySelector('paper-dropdown-menu paper-listbox').select();
		elmEditAccount.querySelector('paper-input[name=account]').value = '';
		elmEditAccount.querySelector('paper-input[name=password]').value = '';

		if(accountId){
			elmEditAccount.querySelector('h1').innerHTML = 'Edit Account';
			elmEditAccount.querySelector('input[name=account-id]').value = accountId;
			main.dbh.getAccount(accountId, function(account){
				// console.log(account);
				var authinfo = JSON.parse(account.authinfo);
				var idx = null;
				$(elmEditAccount).find('paper-dropdown-menu paper-listbox paper-item').each(function(index, elm){
					if( $(elm).attr('value') == account.service ){
						idx = index;
					}
				});
				elmEditAccount.querySelector('paper-dropdown-menu paper-listbox').select(idx);
				elmEditAccount.querySelector('paper-input[name=account]').value = account.account;
				elmEditAccount.querySelector('paper-input[name=password]').value = authinfo.password;
				elmEditAccount.open();
			});
		}else{
			elmEditAccount.open();
		}

		return;
	}

}
