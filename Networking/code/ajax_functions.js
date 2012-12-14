function postFile(filename, isAsync, text, postfunct) {
	var ajaxRequest;

	if (window.XMLHttpRequest)
		ajaxRequest = new XMLHttpRequest();
	else
		ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");

	ajaxRequest.open("POST","write.php",isAsync);
	ajaxRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	ajaxRequest.send("text="+text+"&filename="+filename+"&random="+getRandom());
}

function getFile(filename, postfunct, isAsync) {
	var ajaxRequest;

	if(window.XMLHttpRequest) 
		ajaxRequest = new XMLHttpRequest();
	else
		ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");

	if (isAsync) {
		ajaxRequest.onreadystatechange = function() {
			if (ajaxRequest.readyState==4 && ajaxRequest.status==200) 
				postfunct(ajaxRequest.responseText);
		}
	}

	ajaxRequest.open("GET", filename, isAsync);
	ajaxRequest.send("random="+getRandom());
	
	if (!isAsync) {
		postfunct(ajaxRequest.responseText);
    }
}

function getRandom() {
	return Math.floor(Math.random()*9999999);
}
