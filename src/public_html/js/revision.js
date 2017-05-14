function generateReport(ids) {
	var ids = JSON.stringify(ids);
	var infoArray = {
		type: "DOWNLOAD",
		ids: ids
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
			console.log(json["responseText"]);
		}
	});
}

function downloadSuccess(json) {
	if (json["success"]) {
		var link = document.createElement("a");
		link.setAttribute("href", json["response"]["url"]);
		link.setAttribute("download", "Maths Revision.pdf");
		document.body.appendChild(link);
		link.click();
		console.log(json["response"]["url"]);
	} else {
		console.log(json);
	}
}