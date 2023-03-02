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


/*pocetak:Pocetakk,
            kraj:Krajk*/

$pocetak=$_GET['pocetak'];
$kraj=$_GET['kraj'];
$brzina=$_GET['brzina'];



	
$sql = "WITH uredjenetacke AS 
(Select userid,pointid,t,brzina,geom from korisnici where userid like 'veh%' and t>'$pocetak' and t<'$kraj' order by t,userid)
, tmp AS(select userid,pointid,t,brzina,geom from uredjenetacke )
, lin as(select ST_Transform(st_makeline(geom),4326) traj,avg(brzina) bavg from tmp group by userid)Select ST_AsGeoJSON(ST_Transform(a.geom,4326)) traj from lin k, planet_osm_line a where k.bavg>$brzina and st_DWithin(ST_Transform(k.traj,4326),ST_Transform(a.geom,4326),0.0000001);";



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