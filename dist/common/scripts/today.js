/**
 * Today
 */
module.exports = function(main){
	var remote = require('remote');
	var it79 = require('iterate79');
	var desktopUtils = remote.require('desktop-utils');

	this.update = function(){
		main.accountMgr.syncAll(function(){
			main.dbh.getRecordList(function(records){
				// console.log(records.rows);
				var $listview = $('[data-tab-content=list] .listview');
				$ul = $('<ul>');
				$listview.append($ul);
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
						$li.append( $('<div>').text(row.assigned_user_name+' → '+row.status) );
						$li.append( $('<div>').text(row.end_datetime) );
						$li.append( $('<div>').text('#'+row.account_id) );
						$ul.append($li);
						it1.next();
					},
					function(){
						console.info('Standby!!');
					}
				);
			});
		});
	}
}
