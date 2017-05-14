<?php
$include_path = get_include_path();
include_once $include_path . '/includes/db_functions.php';

$type = filter_input(INPUT_POST,'type',FILTER_SANITIZE_STRING);
$file = filter_input(INPUT_POST,'file',FILTER_SANITIZE_STRING);
$question_ids = json_decode(filter_input(INPUT_POST,'ids',FILTER_SANITIZE_STRING), TRUE);

switch($type) {
	case "DOWNLOAD":
	default:
		download_worksheet($question_ids);
		break;
	case "DELETE":
		delete_worksheet();
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
		//fail_request("There was an error retrieving the questions", $ex);
		fail_request($query, $ex);
	}
	
	$text = "\\documentclass{Class_Files/Welly_Workbook} \\printdiagramstrue \\begin{document} \\nextprobset{Revision Questions} \\begin{questions}";
	foreach ($questions as $question) {
		$qtext = $question["Question"];
		$stext = $question["Solution"];
		$text .= "\Question $qtext \solns{" . $stext . "}";
	}
	$text .= "\\end{questions} \\end{document}";

	file_put_contents("test_latex.tex", $text);
	//exec('sudo mkdir output');
	exec('pdflatex test_latex.tex');
	//$dir = 'Temp';
	//$files = array_diff(scandir($dir), array('.','..')); 
	//foreach ($files as $file) { 
		//(is_dir("$dir/$file")) ? delTree("$dir/$file") : unlink("$dir/$file"); 
	//} 
	//rmdir($dir); 
	unlink("test_latex.tex");
	unlink("test_latex.out");
	unlink("test_latex.log");
	unlink("test_latex.aux");
	unlink("test_latex.sta");

	$response = array("url" => "requests/test_latex.pdf");
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
	