/**
 * Today
 */
module.exports = function(main){
	var _this = this;
	var remote = require('remote');
	var it79 = require('iterate79');
	var desktopUtils = remote.require('desktop-utils');

	var $listview = $('[data-tab-content=list] .listview');
	var $btnRefresh = $('paper-icon-button.btn-refresh');

	this.refresh = function(){
		console.log('today.refresh() start;');

		$btnRefresh.attr({'icon':'autorenew'});
		$listview.html('');

		main.accountMgr.syncAll(function(){
			console.info('syncAll() done!!');
			_this.redraw();
		});
	} // refresh()

	this.redraw = function(){
		console.log('today.redraw() start;');

		$btnRefresh.attr({'icon':'autorenew'});
		$listview.html('');

		main.dbh.getRecordList(function(records){
			// console.log(records.rows);
			$ul = $('<ul>');
			$listview.html('').append($ul);
			it79.ary(
				records.rows,
				function(it1, row, idx){
					// console.log(row);
					var $li = $('<li>');
					$li.append( $('<h3>').text(row.label) );
					$li.append( $('<div>').append($('<a>')
						.text(row.uri)
						.attr({'href':row.uri})
						.click(function(){
							desktopUtils.open(this.href);
							return false;
						})
					) );
					$li.append( $('<div>').text(row.assigned_user_name+' → '+row.status_name) );
					$li.append( $('<div>').text(row.end_datetime) );
					$li.append( $('<div>').text('#'+row.account_id) );
					$ul.append($li);
					it1.next();
				},
				function(){
					$btnRefresh.attr({'icon':'refresh'});
					console.info('Standby!!');
				}
			);
		});

	} // redraw()
}
