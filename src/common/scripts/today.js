/**
 * Today
 */
module.exports = function(main){
	var _this = this;
	var remote = require('remote');
	var it79 = require('iterate79');
	var desktopUtils = remote.require('desktop-utils');

	var $listview = $('[data-tab-content=list] .listview');
	var $calview = $('[data-tab-content=calendar] .listview');
	var $ganttview = $('[data-tab-content=ganttchart] .listview');
	var $btnRefresh = $('paper-icon-button.btn-refresh');

	this.refresh = function(){
		console.log('today.refresh() start;');
		main.loadingStart();

		$btnRefresh.attr({'icon':'autorenew'});

		main.accountMgr.syncAll(function(){
			console.info('syncAll() done!!');
			_this.redraw(function(){
				main.loadingEnd();
			});
		});
	} // refresh()

	this.redraw = function( callback ){
		callback = callback || function(){};
		console.log('today.redraw() start;');

		$btnRefresh.attr({'icon':'autorenew'});
		$listview.html('');
		$calview.html('');
		$ganttview.html('');

		main.dbh.getRecordList(function(records){
			// console.log(records.rows);
			$ul = $('<div>');
			$listview.html('').append($ul);
			it79.ary(
				records.rows,
				function(it1, row, idx){
					// console.log(row);
					var $item = $('<paper-item>')
						.attr({'href':row.uri})
						.click(function(){
							desktopUtils.open($(this).attr('href'));
						})
					;
					$item.append( $('<h3>').text(row.label) );
					$item.append( $('<div>').append($('<span>')
						.text(row.uri)
						// .attr({'href':row.uri})
						// .click(function(){
						// 	desktopUtils.open(this.href);
						// 	return false;
						// })
					) );
					$item.append( $('<div>')
						.append($('<span>').text(row.assigned_user_name))
						.append($('<span>').text(row.status_name))
					);
					$item.append( $('<div>').text(row.end_datetime) );
					$item.append( $('<div>').text('#'+row.account_id) );
					$ul.append($item);
					it1.next();
				},
				function(){
					$btnRefresh.attr({'icon':'refresh'});
					$calview.html($listview.html());
					$ganttview.html($listview.html());
					console.info('Standby!!');
					callback();
				}
			);
		});

	} // redraw()
}
