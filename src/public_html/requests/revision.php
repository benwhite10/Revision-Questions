<?php
$include_path = get_include_path();
include_once $include_path . '/includes/db_functions.php';

$type = filter_input(INPUT_POST,'type',FILTER_SANITIZE_STRING);
$file = filter_input(INPUT_POST,'file',FILTER_SANITIZE_STRING);
$question_ids = json_decode(filter_input(INPUT_POST,'ids',FILTER_SANITIZE_STRING), TRUE);
$year = filter_input(INPUT_POST,'year',FILTER_SANITIZE_STRING);
$name = filter_input(INPUT_POST,'name',FILTER_SANITIZE_STRING);

switch($type) {
	case "DOWNLOAD":
	default:
		download_worksheet($question_ids);
		break;
	case "DELETE":
		delete_worksheet($name);
		break;
	case "QUESTION_INFO":
		get_question_info($year);
		break;
	case "YEAR_GROUPS":
		get_year_groups();
		break;
}

function download_worksheet($ids) {
	$count = count($ids);
	if ($count === 0) fail_request("You have not selected any questions", null);
	$query = "SELECT * FROM TMATHSQUESTIONS MQ ";
	$query .= "WHERE `ID` IN (";
	$i = 0;
	foreach ($ids as $id) {
        $query .= (++$i === $count) ? "$id);" : "$id, ";
    }
	
	try{
		$questions = db_select_exception($query);
	} catch (Exception $ex) {
		fail_request("There was an error retrieving the questions", $ex);
	}
	
	$text = "\\documentclass{Class_Files/Welly_Workbook} \\printdiagramstrue \\begin{document} \\nextprobset{Revision Questions} \\begin{questions}";
	foreach ($questions as $question) {
		$qtext = $question["Question"];
		$text .= "\Question $qtext ";
	}
	$text .= "\\end{questions} \\nextprobset{Solutions} \\begin{questions}";
	foreach ($questions as $question) {
		$stext = $question["Solution"];
		$text .= "\Question $stext ";
	}
	$text .= "\\end{questions} \\end{document}";
	$file_name = time() . rand(100,999);
	file_put_contents("$file_name.tex", $text);
	exec("pdflatex -interaction=batchmode $file_name.tex"); 
	if (file_exists("$file_name.tex")) unlink("$file_name.tex");
	if (file_exists("$file_name.out")) unlink("$file_name.out");
	if (file_exists("$file_name.log")) unlink("$file_name.log");
	if (file_exists("$file_name.aux")) unlink("$file_name.aux");
	if (file_exists("$file_name.sta")) unlink("$file_name.sta");

	$response = array("name" => "$file_name.pdf", "text" => $text);
	succeed_request($response);
}

function delete_worksheet($name) {
	if (file_exists($name)) unlink($name);
	succeed_request(null);
}

function get_year_groups() {
	$query = "SELECT `Year` FROM `tmathsquestions` GROUP BY `Year`";
	try{
		$years = db_select_exception($query);
	} catch (Exception $ex) {
		fail_request("There was an error retrieving the year groups", $ex);
	}
	$response = array("years" => $years);
	succeed_request($response);
}

function get_question_info($year) {
	$query = "SELECT `ID`, `Unit`, `Topic`, `Difficulty` FROM `tmathsquestions` WHERE `Year` = '$year' ORDER BY `Unit`, `Topic`;";
	try{
		$questions = db_select_exception($query);
	} catch (Exception $ex) {
		fail_request("There was an error retrieving the questions", $ex);
	}
	$return_topics = [];
	foreach ($questions as $question) { 
		$topic_name = $question["Unit"] . " - " . $question["Topic"];
		foreach ($return_topics as $key => $topic) {
			if($topic["Name"] === $topic_name) {
				switch($question["Difficulty"]) {
					case "Easy":
						$easy_ids_array = $topic["easy_ids"];
						array_push($easy_ids_array, $question["ID"]);
						$return_topics[$key]["easy_ids"] = $easy_ids_array;
						break;
					case "Medium":
						$med_ids_array = $topic["med_ids"];
						array_push($med_ids_array, $question["ID"]);
						$return_topics[$key]["med_ids"] = $med_ids_array;
						break;
					case "Hard":
						$hard_ids_array = $topic["hard_ids"];
						array_push($hard_ids_array, $question["ID"]);
						$return_topics[$key]["hard_ids"] = $hard_ids_array;
						break;
				}
				continue 2;
			}
		}
		$array = array(
			"Name" => $topic_name,
			"easy_ids" => [],
			"med_ids" => [],
			"hard_ids" => []);
		switch($question["Difficulty"]) {
			case "Easy":
				$array["easy_ids"] = [$question["ID"]];
				break;
			case "Medium":
				$array["med_ids"] = [$question["ID"]];
				break;
			case "Hard":
				$array["hard_ids"] = [$question["ID"]];
				break;
		}
		array_push($return_topics, $array);
	}
	$response = array("topics" => $return_topics);
	succeed_request($response);
}

function fail_request($message, $ex) {
	$ex_msg = $ex ? $ex->getMessage() : "";
	$response_array = array(
		"success" => FALSE,
		"message" => $message,
		"exception_msg" => $ex_msg);
	echo json_encode($response_array);
	exit();
}

function succeed_request($response) {
	$response_array = array(
		"success" => TRUE,
		"response" => $response);
	echo json_encode($response_array);
	exit();
}
	