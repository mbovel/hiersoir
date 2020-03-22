<?php

require_once "config.php";

function error($code, $message)
{
	http_response_code($code);
	echo '{"error": "' . $message . '"}';
	die();
}


function get_file_path($id)
{
	$filename = preg_replace('/[^A-Za-z0-9_\-]/', '_', $id) . ".json";
	return DATA_DIR . DIRECTORY_SEPARATOR . $filename;
}
