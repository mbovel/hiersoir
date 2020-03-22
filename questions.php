<?php

$questions_str = file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . "questions.txt");
$questions = [];

foreach (explode("\n\n", $questions_str) as $i => $question_str) {
	list($head_str, $choices_str) = explode("\n", $question_str, 2);
	list($tag_str, $label_str) = explode(" ", $head_str, 2);

	$choices = [];
	foreach (explode("\n", $choices_str) as $i => $choice_str) {
		$choices[] = trim($choice_str, "- ");
	}

	$questions[] = [
		"type" => trim($tag_str, "# "),
		"label" => trim($label_str, " "),
		"choices" => $choices
	];
}

define("QUESTIONS", $questions);
