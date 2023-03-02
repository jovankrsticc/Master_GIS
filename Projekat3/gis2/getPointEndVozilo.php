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

if (isset($_GET['vozilo'])){
    $vozilo = $_GET['vozilo'];
}

//create basic sql statement
$sql = "Select userid, ST_AsGeoJSON(ST_Transform(geom,4326)) pt,t from korisnici where userid='$vozilo' order by t DESC LIMIT 1; ";


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