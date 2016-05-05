module.exports = function(main){

	/**
	 * セッティングウィンドウを開く
	 */
	this.open = function(){
		var elm = document.getElementById('settings');
		elm.open();
		document.querySelector('iron-list').items = [
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
			elm.fit();
		}, 150);
	}

	/**
	 * 新しいアカウントを追加する
	 */
	this.newAccount = function(){
		alert('new account.');
	}

}
