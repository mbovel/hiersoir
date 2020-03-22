<?php

$dir = new DirectoryIterator(dirname(__FILE__) . DIRECTORY_SEPARATOR . "data");

$current_time = time();
$min_time = $current_time - 3600 * 24 * 7; // 5 days ago

foreach ($dir as $fileinfo) {
	if (!$fileinfo->isDot()) {
		if ($fileinfo->getMTime() < $min_time) {
			echo "Removing " . $fileinfo->getPathname();
			unlink($fileinfo->getPathname());
		}
	}
}
