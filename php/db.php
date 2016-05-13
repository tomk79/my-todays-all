<?php
/**
 * command "db.php".
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
require_once( __DIR__.'/../vendor/autoload.php' );

@ini_set( 'memory_limit' , -1 );

$argv = $_SERVER['argv'];

array_shift($argv);
$query = array_pop($argv);
$conf = array('path_db'=>null);

for( $i = 0; $i < count($argv); $i ++ ){
	if( $argv[$i] == '--db' ){
		if( preg_match( '/^\-[a-zA-Z0-9\-\_]+$/s', $argv[$i+1] ) ){
			continue;
		}
		$i++;
		$conf['path_db'] = $argv[$i];
		continue;
	}
}

if( @is_null($conf['path_db']) ){
	exit;
}


// ROM "Idiorm"
ORM::configure('sqlite:'.$conf['path_db']);

// var_dump($query);
// $query = base64_decode( $query );
$query = json_decode( $query );
// var_dump($query);

$rtn = array();
$rtn['error'] = 0;
$rtn['message'] = 'success';

switch( $query->method ){
	case "initialize":
		$db = ORM::get_db();
		ob_start();?>
			CREATE TABLE IF NOT EXISTS accounts (
				id INTEGER PRIMARY KEY,
				service STRING,
				account STRING,
				authinfo TEXT,
				createdAt DATETIME,
				updatedAt DATETIME
			);<?php
		$db->exec( trim( ob_get_clean() ) );

		ob_start();?>
			CREATE TABLE IF NOT EXISTS records (
				remote_id STRING PRIMARY KEY,
				account_id INTEGER,
				label TEXT,
				description TEXT,
				uri TEXT,
				phase_name TEXT,
				category_name TEXT,
				assigned_user_name STRING,
				posted_user_name STRING,
				status_name STRING,
				status INTEGER,
				start_datetime DATETIME,
				end_datetime DATETIME,
				createdAt DATETIME,
				updatedAt DATETIME
			);<?php
		$db->exec( trim( ob_get_clean() ) );
		$rtn['data'] = true;

	case "getAccountList":
		$result = ORM::for_table('accounts')
			->find_array();
		$rtn['data'] = $result;
		break;

	case "getAccount":
		$result = ORM::for_table('accounts')
			->where_equal('id', $query->account_id)
			->find_array();
		$result[0]['authinfo'] = json_decode( base64_decode($result[0]['authinfo']) );
		$rtn['data'] = $result[0];
		break;

	case "addAccount":
		$new = ORM::for_table('accounts')->create();
		$new->service = $query->service;
		$new->account = $query->account;
		$new->authinfo = base64_encode(json_encode($query->authinfo));
		$new->createdAt = @date('c', time());
		$new->updatedAt = @date('c', time());
		$new->save();
		$rtn['data'] = true;
		break;

	case "updateAccount":
		$row = ORM::for_table('accounts')->find_one($query->account_id);
		$row->set(array(
			'service' => $query->service,
			'account' => $query->account,
			'authinfo' => base64_encode(json_encode($query->authinfo)),
			'updatedAt' => @date('c', time())
		));
		$row->save();
		$rtn['data'] = true;
		break;

	case "deleteAccount":
		$result = ORM::for_table('accounts')
			->where_equal('id', $query->account_id)
			->delete_many();
		$rtn['data'] = $result;
		break;

	case "getRecordList":
		$result = ORM::for_table('records')
			->where('status', 1)
			->order_by_asc('end_datetime')
			->find_array();
		$rtn['data'] = $result;
		break;

	case "updateRecord":
		$found = ORM::for_table('records')
			->where_equal(array(
				'account_id' => $query->account_id,
				'remote_id' => $query->remote_id,
				'uri' => $query->uri
			))
			->find_many();
		$data = array(
			'account_id' => $query->account_id,
			'remote_id' => $query->remote_id,
			'uri' => $query->uri,
			'label' => $query->label,
			'status' => $query->status,
			'status_name' => $query->status_name,
			'phase_name' => $query->phase_name,
			'category_name' => $query->category_name,
			'assigned_user_name' => $query->assigned_user_name,
			'posted_user_name' => $query->posted_user_name,
			'start_datetime' => $query->start_datetime,
			'end_datetime' => $query->end_datetime,
			'updatedAt' => @date('c', time())
		);

		if(count($found)){
			$found[0]->set($data);
			$found[0]->save();
		}else{
			$new = ORM::for_table('records')->create();
			$new->set($data);
			$new->createdAt = @date('c', time());
			$new->save();
		}
		$rtn['data'] = true;
		break;

	case "deleteRecordsOfAccount":
		$result = ORM::for_table('records')
			->where_equal('account_id', $query->account_id)
			->delete_many();
		$rtn['data'] = $result;
		break;
}

@header('Content-Type: application/json');
print json_encode(
	$rtn
);
exit();
