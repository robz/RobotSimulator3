<?php
	echo $_POST['text'];
	$FILENAME = $_POST['filename'];
	$HANDLE = fopen($FILENAME, 'w') or die ('CANT OPEN FILE '.$FILENAME);
	fwrite($HANDLE, $_POST['text']);
	fclose($HANDLE);
?>
