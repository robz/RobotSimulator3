<?php
	$clientText = $_GET['text'];
	$clientID = $_GET['id'];
	
	$filename = "data.txt";
	$idfile = "id.txt";
	
	$serverID = file_get_contents($idfile);
	$serverText = file_get_contents($filename);
	
	$pausetime = 100000;
	$timeouttime = 30000000;
	
	$timeoutcount = $timeouttime/$pausetime;
	$counter = 0;
	while($counter < $timeoutcount && 
			($serverID === $clientID || $serverText === $clientText)) {
		$serverID = file_get_contents($idfile);
		$serverText = file_get_contents($filename);
		usleep($pausetime);
		$counter++;
	}
	
	$status = "ripe";
	if ($counter == $timeoutcount)
		$status = "rotten";
	echo '{"status":"'.$status.'","ID":"'.$serverID.'","clientText":"'.$clientText.'","serverText":"'.$serverText.'"}';
?>