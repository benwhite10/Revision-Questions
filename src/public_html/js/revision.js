$(document).ready(function(){
	request_year_groups();
	setInterval(function(){ delete_all_old(); }, 60 * 1000);
});

function request_year_groups() {
	var infoArray = {
		type: "YEAR_GROUPS"
	}
	$.ajax({
		type: "POST",
		data: infoArray,
		url: "/requests/revision.php",
		dataType: "json",
		success: function(json){
			if(json["success"]){
				write_year_groups(json)
			} else {
				console.log(json);
			}
		},
		error: function(json){
			console.log(json);
		}
	});
}

function request_questions(year) {
	var infoArray = {
		type: "QUESTION_INFO",
		year: year
	}
	$.ajax({
		type: "POST",
		data: infoArray,
		url: "/requests/revision.php",
		dataType: "json",
		success: function(json){
			if(json["success"]){
				write_questions(json)
			} else {
				console.log(json);
			}
		},
		error: function(json){
			console.log(json);
		}
	});
}

function delete_all_old() {
	var infoArray = {
		type: "DELETE_ALL"
	}
	$.ajax({
		type: "POST",
		data: infoArray,
		url: "/requests/revision.php",
		dataType: "json",
		success: function(json){

		},
		error: function(json){
			console.log(json);
		}
	});
}

function write_year_groups(json) {
	var year_groups = json["response"]["years"];
	if (year_groups.length === 0) {
		$("#year_group_select").html("<option>No Year Groups</option>");
		return;
	}
	var inner_html = "";
	for (i = 0; i < year_groups.length; i++) {
		inner_html += "<option>" + year_groups[i]["Year"] + "</option>";
	}
	$("#year_group_select").html(inner_html);
	change_year_group();
}

function change_year_group() {
	request_questions($("#year_group_select").val());
}

function write_questions(json) {
	var topics = json["response"]["topics"];
	var inner_html = "";
	for (i = 0; i < topics.length; i++) {
		title = topics[i]["Name"];
		easy_ids = topics[i]["easy_ids"];
		med_ids = topics[i]["med_ids"];
		hard_ids = topics[i]["hard_ids"];
		inner_html += "<div class='topic_row' id='row_" + i + "'>";
		inner_html += "<div class='topic_row_title'><h2>" + title + "</h2></div>";
		inner_html += "<div class='topic_row_select easy'><div class='topic_row_top easy'>Easy</div><div class='topic_row_bottom easy'><select class='questions_select easy'  name='questions_e_" + i + "' id='questions_e_" + i + "'>";
		inner_html += "<option>0</option>";
		for (j=0; j < easy_ids.length; j++) {
			inner_html += "<option>" + (j + 1) + "</option>";
		}
		inner_html += "</select></div>";
		inner_html += "<input type='hidden' value='" + JSON.stringify(easy_ids) + "' id='ids_e_" + i + "'/></div>";
		
		inner_html += "<div class='topic_row_select medium'><div class='topic_row_top medium'>Medium</div><div class='topic_row_bottom medium'><select class='questions_select medium' name='questions_m_" + i + "' id='questions_m_" + i + "'>";
		inner_html += "<option>0</option>";
		for (j=0; j < med_ids.length; j++) {
			inner_html += "<option>" + (j + 1) + "</option>";
		}
		inner_html += "</select></div>";
		inner_html += "<input type='hidden' value='" + JSON.stringify(med_ids) + "' id='ids_m_" + i + "'/></div>";
		
		inner_html += "<div class='topic_row_select hard'><div class='topic_row_top hard'>Hard</div><div class='topic_row_bottom hard'><select class='questions_select hard'  name='questions_h_" + i + "' id='questions_h_" + i + "'>";
		inner_html += "<option>0</option>";
		for (j=0; j < hard_ids.length; j++) {
			inner_html += "<option>" + (j + 1) + "</option>";
		}
		inner_html += "</select></div>";
		inner_html += "<input type='hidden' value='" + JSON.stringify(hard_ids) + "' id='ids_h_" + i + "'/></div>";
		inner_html += "</div>";
	}
	$("#topics_div").html(inner_html);
}

function generateReport() {
	var final_ids = [];
	for (var j = 0; j < 1000; j++) {
		if($("#questions_e_" + j).length) {
			if($("#questions_e_" + j).val() > 0) {
				ids = get_random_ids(JSON.parse($("#ids_e_" + j).val()), $("#questions_e_" + j).val());
				final_ids = add_ids_to_array(final_ids, ids);
			}
		} else {
			break;
		}
		if($("#questions_m_" + j).length) {
			if($("#questions_m_" + j).val() > 0) {
				ids = get_random_ids(JSON.parse($("#ids_m_" + j).val()), $("#questions_m_" + j).val());
				final_ids = add_ids_to_array(final_ids, ids);
			}
		} else {
			break;
		}
		if($("#questions_h_" + j).length) {
			if($("#questions_h_" + j).val() > 0) {
				ids = get_random_ids(JSON.parse($("#ids_h_" + j).val()), $("#questions_h_" + j).val());
				final_ids = add_ids_to_array(final_ids, ids);
			}
		} else {
			break;
		}
		// Removing this line causes an infinite loop
		test = "Test";
	}
	$("#generate_button").html("<h3>Generating...</h3>");
	$("#generate_button").attr('onclick', '');
	var name = $("#name_input").val();
	var infoArray = {
		type: "DOWNLOAD",
		ids: JSON.stringify(final_ids),
		name: name
	};
	$.ajax({
		type: "POST",
		data: infoArray,
		url: "/requests/revision.php",
		dataType: "json",
		success: function(json){
			downloadSuccess(json);
		},
		error: function(json){
			alert("There was an error downloading the worksheet. Please refresh the page and try again");
			console.log(json["responseText"]);
		}
	});
}

function add_ids_to_array(array, ids) {
	for (var i = 0; i < ids.length; i++) {
		array.push(parseInt(ids[i]));
	}
	return array;
}

function get_random_ids(ids, num) {
	var final_ids = [];
	var used_ids = [];
	for (i = 0; i < num; i++) {
		for (j = 0; j < 1000; j++) {
			rand = Math.floor(Math.random() * ids.length);
			if (!array_contains(used_ids, rand)){
				final_ids.push(ids[rand]);
				used_ids.push(rand);
				break;
			}
		}
	}
	return final_ids;
}

function array_contains(array, val) {
	for (i = 0; i < array.length; i++) {
		if(array[i] === val) return true;
	}
	return false;
}

function downloadSuccess(json) {
	if (json["success"]) {
		var link = document.createElement("a");
		link.setAttribute("href", "requests/" + json["response"]["name"]);
		link.setAttribute("download", json["response"]["sheet_name"] + ".pdf");
		document.body.appendChild(link);
		link.click();
		setTimeout(function(){ 
				delete_worksheet_request(json["response"]["name"]); 
			}, 20 * 1000);
	} else {
		if (json["message"] === "You have not selected any questions") {
			alert("You have not selected any questions. Please try again.");
		} else {
			alert("There was an error downloading the worksheet. Please refresh the page and try again");
		}
		console.log(json);
	}
	$("#generate_button").html("<h3>Generate Worksheet</h3>");
	$("#generate_button").attr('onclick', 'generateReport()');
}

function delete_worksheet_request(name) {
	var infoArray = {
		type: "DELETE",
		name: name
	};
	$.ajax({
		type: "POST",
		data: infoArray,
		url: "/requests/revision.php",
		dataType: "json",
		success: function(json){
		},
		error: function(json){
			console.log(json);
		}
	});
}