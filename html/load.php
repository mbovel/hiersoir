<?php

require_once "../config.php";
require_once "../utils.php";

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') error(400, "Expect a GET request.");
if (empty($_GET["id"])) error(400, "Missing ID parameter.");

$file_path = get_file_path($_GET["id"]);
if (!file_exists($file_path)) error(404, "Unknown ID.");

$content = file_get_contents($file_path);
if ($content === false) error(500, "Cannot load content.");

echo $content;
