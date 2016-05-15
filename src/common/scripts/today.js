/**
 * Today
 */
module.exports = function(main){
	var _this = this;
	var remote = require('remote');
	var it79 = require('iterate79');
	var desktopUtils = remote.require('desktop-utils');

	var $listview = $('[data-tab-content=list] .list__outline');
	var $calview = $('[data-tab-content=calendar] .listview');
	var $ganttview = $('[data-tab-content=ganttchart] .listview');
	var $btnRefresh = $('paper-icon-button.btn-refresh');
	var accountList = {};

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
		$listview.find('.listview').html('');
		$calview.html('');
		$ganttview.html('');

		main.dbh.getAccountList(function(result){
			accountList = {};
			for(var idx in result.rows){
				accountList[result.rows[idx].id] = result.rows[idx];
			}
			console.log(accountList);

			main.dbh.getRecordList(function(records){
				// console.log(records.rows);
				$ul = {
					'unlimited': $('<div>'),
					'expiration': $('<div>'),
					'today': $('<div>'),
					'near': $('<div>')
				};
				$listview.find('.list__listview-unlimited .listview').html('').append($ul['unlimited']);
				$listview.find('.list__listview-expiration .listview').html('').append($ul['expiration']);
				$listview.find('.list__listview-today .listview').html('').append($ul['today']);
				$listview.find('.list__listview-near .listview').html('').append($ul['near']);
				$listview.find('.list__listview-unlimited').hide();
				$listview.find('.list__listview-expiration').hide();
				$listview.find('.list__listview-today').hide();
				$listview.find('.list__listview-near').hide();

				it79.ary(
					records.rows,
					function(it1, row, idx){
						// console.log(row);
						var $item = $('<paper-item>')
							.attr({'href':row.uri})
							.dblclick(function(){
								desktopUtils.open($(this).attr('href'));
							})
						;
						$item.append( $('<h3>').text(row.label) );
						$item.append( $('<div>').append($('<a>')
							.append( $('<paper-icon-button icon="explore">') )
							.append( $('<span>').text(row.uri) )
							.attr({'href':row.uri})
							.click(function(){
								desktopUtils.open(this.href);
								return false;
							})
						) );
						$item.append( $('<div>')
							.append($('<span>').text(row.assigned_user_name))
							.append($('<span class="status">').text(row.status_name))
						);
						var endTime = new Date(row.end_datetime);
						$item.append( $('<div>').text('期限: ' + ( row.end_datetime ? endTime.getFullYear() + '/' + (endTime.getMonth()+1) + '/' + endTime.getDate() : '---' ) ) );
						$item.append( $('<div>').append( $('<span class="service">').addClass('service__'+accountList[row.account_id].service).text(accountList[row.account_id].service+'#'+row.account_id) ) );

						if( !row.end_datetime ){
							$ul['unlimited'].append($item);
						}else{
							var endTime = new Date(row.end_datetime);
							var now = new Date();
							var today = now.getFullYear()*10000 + (now.getMonth()+1)*100 + now.getDate()
							var endDay = endTime.getFullYear()*10000 + (endTime.getMonth()+1)*100 + endTime.getDate()
							// console.log(today);
							// console.log(endDay);
							// console.log($ul['today'].find('>*').size());
							if( today == endDay ){
								$ul['today'].append($item);
							}else if( today > endDay ){
								$ul['expiration'].append($item);
							}else{
								if($ul['today'].find('>*').size() < 7){
									$ul['today'].append($item);
								}else{
									$ul['near'].append($item);
								}
							}
						}
						it1.next();
					},
					function(){
						for(var idx in $ul){
							if( $ul[idx].find('>*').size() ){
								$listview.find('.list__listview-'+idx).show();
							}
						}
						$('.list__outline').show();


						$btnRefresh.attr({'icon':'refresh'});
						$calview.html($listview.find('.list__listview-today .listview').html()); // TODO: 暫定
						$ganttview.html($listview.find('.list__listview-today .listview').html()); // TODO: 暫定
						console.info('Standby!!');
						callback();
					}
				);
			});
		});

	} // redraw()
}
