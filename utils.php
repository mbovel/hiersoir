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

function check_recaptcha($token)
{
	$url = 'https://www.google.com/recaptcha/api/siteverify';
	$data = ['secret' => RECAPTCHA_SECRET, 'response' => $token];

	$options = array(
		'http' => array(
			'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
			'method'  => 'POST',
			'content' => http_build_query($data)
		)
	);
	$context  = stream_context_create($options);
	$result = file_get_contents($url, false, $context);

	if ($result === FALSE) {
		error(500, "Could not verify recaptcha token: request failed.");
	}

	$result_data = json_decode($result);

	if (!is_object($result_data) || empty($result_data->success) || empty($result_data->score)) {
		error(500, "Could not verify recaptcha token: invalid request or response.");
	}

	if (floatval($result_data->score) < 0.7) {
		error(400, "Seems like you're not human after all :'(");
	}
}
