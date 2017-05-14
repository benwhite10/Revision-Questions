function generateReport() {
	var infoArray = {
		type: "DOWNLOAD"
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
	console.log("Success");
	if (json["success"]) {
		var link = document.createElement("a");
		link.setAttribute("href", json["url"]);
		link.setAttribute("download", "Maths Revision.pdf");
		document.body.appendChild(link);
		link.click();
		console.log(json["url"]);
	}
}