<?php

require_once "../config.php";
require_once "../utils.php";

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') error(400, "Expect a POST request.");
if (empty($_POST["data"])) error(400, "Missing data parameter.");

do {
	$id = uniqid();
	$file_path = get_file_path($id);
} while (file_exists($id));

$result = file_put_contents($file_path, $_POST["data"]);

if ($result === false) error(500, "Cannot store content.");

echo '{"id": "' . $id . '"}';
