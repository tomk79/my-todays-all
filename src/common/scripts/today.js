/**
 * Today
 */
module.exports = function(main){
	var _this = this;
	var remote = require('remote');
	var it79 = require('iterate79');
	var desktopUtils = remote.require('desktop-utils');

	var $todaysListView = $('[data-tab-content=list] .list__outline');
	// var $calendarView = $('[data-tab-content=calendar] .listview');
	var $ganttChartView = $('[data-tab-content=ganttchart] .ganttchart__outline');
	var $btnRefresh = $('paper-icon-button.btn-refresh');
	var accountList = {};

	var day = ['日','月','火','水','木','金','土']

	/**
	 * APIから情報を取得しなおして再描画する
	 */
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

	/**
	 * DBからの情報で再描画する
	 */
	this.redraw = function( callback ){
		callback = callback || function(){};
		console.log('today.redraw() start;');

		$btnRefresh.attr({'icon':'autorenew'});
		$todaysListView.hide();
		$ganttChartView.hide();

		main.dbh.getAccountList(function(result){
			var activeAccountList = [];
			accountList = {};
			for(var idx in result.rows){
				accountList[result.rows[idx].id] = result.rows[idx];

				if( Number(result.rows[idx].active_flg) ){
					activeAccountList.push(result.rows[idx].id);
				}
			}
			// console.log(accountList);
			// console.log(activeAccountList);

			main.dbh.getRecordList(activeAccountList, function(result){
				records = result;
				// console.log(records);

				redrawToday(function(){
					redrawGanttChart(function(){
						$btnRefresh.attr({'icon':'refresh'});
						console.info('All Standby!!');
						callback();
					});
				});
			});
		});

	} // redraw()

	/**
	 * 日付情報から、 yyyymmdd形式の数値を生成する
	 */
	function genDateInt(date){
		date = new Date(date);
		return date.getFullYear()*10000 + (date.getMonth()+1)*100 + date.getDate();
	}

	/**
	 * 日付情報から、 表示できる形式の日付文字列を生成する
	 */
	function genDateDisplay(date){
		date = new Date(date);
		return date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' ('+ day[date.getDay()] +')';
	}

	/**
	 * Today タブを再描画
	 */
	function redrawToday(callback){
		callback = callback || function(){};

		$ul = {
			'unlimited': $('<div>'),
			'expiration': $('<div>'),
			'today': $('<div>'),
			'near': $('<div>')
		};
		$todaysListView.find('.list__listview-unlimited .listview').html('').append($ul['unlimited']);
		$todaysListView.find('.list__listview-expiration .listview').html('').append($ul['expiration']);
		$todaysListView.find('.list__listview-today .listview').html('').append($ul['today']);
		$todaysListView.find('.list__listview-near .listview').html('').append($ul['near']);
		$todaysListView.find('.list__listview-unlimited').hide();
		$todaysListView.find('.list__listview-expiration').hide();
		$todaysListView.find('.list__listview-today').hide();
		$todaysListView.find('.list__listview-near').hide();

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
				$item.append( $('<div>').text('期限: ' + ( row.end_datetime ? genDateDisplay(endTime) : '---' ) ) );
				$item.append( $('<div>').append( $('<span class="service">').addClass('service__'+accountList[row.account_id].service).text(accountList[row.account_id].service+' (#'+row.account_id+')') ) );

				if( !row.end_datetime ){
					$ul['unlimited'].append($item);
				}else{
					var endTime = new Date(row.end_datetime);
					var now = new Date();
					var today = genDateInt(now);
					var endDate = genDateInt(endTime);
					// console.log(today);
					// console.log(endDate);
					// console.log($ul['today'].find('>*').size());
					if( today == endDate ){
						$ul['today'].append($item);
					}else if( today > endDate ){
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
						$todaysListView.find('.list__listview-'+idx).show();
					}
				}

				$todaysListView.show();
				console.info('Today Standby!!');
				callback();
			}
		);
		return;
	} // redrawToday()

	/**
	 * ガントチャートを再描画
	 */
	function redrawGanttChart(callback){
		callback = callback || function(){};
		var minEndTime = (new Date()).getTime();
		var maxEndTime = (new Date()).getTime();

		$ganttChartView.find('.listview').css({
			'height': $(window).innerHeight() - $('#paper-toolbar').outerHeight() - $('paper-tabs').outerHeight() - 80
		});
		$ganttChartView.find('.listview').scroll(function(e){
			var $this = $(this);
			var sTop = $this.scrollTop();
			var sLeft = $this.scrollLeft();
			$this.find('table.ganttchart__thead').css({
				'top': sTop
			});
			$this.find('table.ganttchart__th').css({
				'left': sLeft
			});
			$this.find('table.ganttchart__spacer').css({
				'top': sTop,
				'left': sLeft
			});
		});
		for(var idx in records.rows){
			if(!records.rows[idx].end_datetime){continue;}
			var endTime = new Date(records.rows[idx].end_datetime).getTime();
			if( minEndTime > endTime ){
				minEndTime = endTime;
			}
			if( maxEndTime < endTime ){
				maxEndTime = endTime;
			}
		}
		var minDate = genDateInt(minEndTime);
		var maxDate = genDateInt(maxEndTime);
		// console.log( (new Date(minEndTime)).toString() );
		// console.log( (new Date(maxEndTime)).toString() );
		var toDay = genDateInt(new Date());

		$ganttChartView.find('.listview').html( '' );

		var $table = $('<table class="ganttchart__main">');
		var $tableHeader = $('<table class="ganttchart__thead">');
		var $tableTh = $('<table class="ganttchart__th">');
		var $tableSpacer = $('<table class="ganttchart__spacer">');
		var $chart = $('<div class="ganttchart__chart">');
		var $thead = $('<thead>');
		var $theadR1 = $('<tr>');
		var $theadR2 = $('<tr>');
		var $theadR3 = $('<tr>');
		var $theadR4 = $('<tr>');
		var $tbody = $('<tbody>');
		$theadR1.append('<th rowspan="4"><div style="width: 180px;">');
		$tableHeader.append('<thead>');
		$tableTh.append('<thead><th rowspan="4"><div style="width: 180px;">').append('<tbody>');
		$tableSpacer.append('<thead><th rowspan="4"><div style="width: 180px;">');
		var datePointer = minEndTime;
		var daysCounter = 0;
		var commonTd = '';
		while(1){
			// console.log(datePointer);
			var pointerDate = genDateInt(datePointer);
			if( pointerDate > maxDate + 7 ){
				break;
			}
			if( daysCounter > 180 ){
				break;
			}
			daysCounter ++;

			var isToday = (pointerDate==toDay ? true : false);
			var cssClass = (isToday ? ' class="gantt__toady"' : '');

			$theadR1.append( $('<th'+cssClass+'>')
				.append( $('<div class="gantt__header-by-date">').text( new Date(datePointer).getFullYear() ) )
			);
			$theadR2.append( $('<th'+cssClass+'>')
				.append( $('<div class="gantt__header-by-date">').text( new Date(datePointer).getMonth()+1 ) )
			);
			$theadR3.append( $('<th'+cssClass+'>')
				.append( $('<div class="gantt__header-by-date">').text( new Date(datePointer).getDate() ) )
			);
			$theadR4.append( $('<th'+cssClass+'>')
				.append( $('<div class="gantt__header-by-date">').text( day[new Date(datePointer).getDay()] ) )
			);
			commonTd += '<td'+cssClass+'></td>';
			datePointer = datePointer + (24*60*60*1000);
		}

		$table.append( $thead
			.append( $theadR1 )
			.append( $theadR2 )
			.append( $theadR3 )
			.append( $theadR4 )
		).append( $tbody );

		$tableHeader.find('thead').html( $thead.html() );

		$ganttChartView.find('.listview')
			.append( $table )
			.append( $chart )
			.append( $tableHeader )
			.append( $tableTh )
			.append( $tableSpacer )
		;


		it79.ary(
			records.rows,
			function(it1, row, idx){
				// console.log(row);
				var $item = $('<tr>');
				$item.append( $('<th>').append( $('<div style="width: 180px;">').text(row.label) ) );
				$item.append( commonTd );

				$tbody.append($item);

				$tableTh.find('tbody').append( $('<tr>')
					.append( $('<th>')
						.append( $('<div style="width: 180px;">').text(row.label) )
					)
				);

				if( !row.end_datetime ){
					var $chartBar = $('<div>');
					$chartBar
						.addClass('ganttchart__chart_bar')
						.addClass('ganttchart__chart_bar--unlimited')
						.text('期限未設定')
						.css({
							'top': (idx*40) + 135,
							'left': 180 + 10
						})
					;
					$chart.append( $chartBar );
					it1.next();
					return;
				}

				var now = new Date(),
					today = genDateInt(now);
				var endTime = null, endDate = null;
				if( row.end_datetime ){
					endTime = new Date(row.end_datetime);
					endDate = genDateInt(endTime);
				}
				var startTime = endTime, startDate = endDate;
				if( row.start_datetime ){
					startTime = new Date(row.start_datetime);
					startDate = genDateInt(startTime);
				}

				var barWidth = Math.floor(((endTime.getTime() - startTime.getTime()) /24/60/60/1000) + 1) * (30+9) -1;
				var barLeft = Math.floor(((startTime.getTime() - minEndTime) /24/60/60/1000) + 1) * (30+9);

				var $chartBar = $('<div>');
				$chartBar
					.addClass('ganttchart__chart_bar')
					.css({
						'top': (idx*40) + 135,
						'left': 180 + 10 + barLeft,
						'width': barWidth
					})
					.text( genDateDisplay(startTime) + ' - ' + genDateDisplay(endTime) )
				;
				$chart.append( $chartBar );

				it1.next();
			},
			function(){
				$ganttChartView.show();
				console.info('GanttChart Standby!!');
				callback();

			}
		);

		return;
	} // redrawGanttChart()

}
