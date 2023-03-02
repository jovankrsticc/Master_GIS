<?php
ini_set('display_errors', 1); 

//database login info
$host = 'localhost';
$port = '5432';
$dbname = 'Mobtest';
$user = 'postgres';
$password = '1234';

$conn = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");
if (!$conn) {
	echo "Not connected : " . pg_error();
	exit;
}

//create basic sql statement
$sql = "Select userid from korisnici group by userid order by userid;";


//send the query
if (!$response = pg_query($conn, $sql)) {
	echo "A query error occured.\n";
	exit;
}

//echo the data back to the DOM
while ($row = pg_fetch_row($response)) {
	foreach ($row as $i => $attr){
		echo $attr.", ";
	}
	echo ";";
}

?>