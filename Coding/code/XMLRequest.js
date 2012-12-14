function sendRequest(url, callback, postData) {
	var req = createXMLHTTPObject();
	if (!req) return;
	var method = (postData) ? "POST" : "GET";
	req.open(method,url,true);
	if (postData)
		req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
	req.onreadystatechange = function () {
		if (req.readyState != 4) return;
		if (req.status != 200 && req.status != 304) {
//			alert('HTTP error ' + req.status);
			return;
		}
		callback(req);
	}
	if (req.readyState == 4) return;
	req.send(postData);
}

var XMLHttpFactories = [
	function () {return new XMLHttpRequest()},
	function () {return new ActiveXObject("Msxml2.XMLHTTP")},
	function () {return new ActiveXObject("Msxml3.XMLHTTP")},
	function () {return new ActiveXObject("Microsoft.XMLHTTP")}
];

function createXMLHTTPObject() {
	var xmlhttp = false;
	for (var i=0;i<XMLHttpFactories.length;i++) {
		try {
			xmlhttp = XMLHttpFactories[i]();
		}
		catch (e) {
			continue;
		}
		break;
	}
	return xmlhttp;
}

function postFile(filename, text, isAsync, postfunct) {
	var ajaxRequest;

	if (window.XMLHttpRequest)
		ajaxRequest = new XMLHttpRequest();
	else
		ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
		
	if (isAsync) {
		ajaxRequest.onreadystatechange = function() {
			if (ajaxRequest.readyState==4 && ajaxRequest.status==200) 
				postfunct(ajaxRequest.responseText);
		}
	}

	ajaxRequest.open("POST", "write.php", isAsync);
	ajaxRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	ajaxRequest.send("text="+text+"&filename="+filename+"&random="+Math.random());
}
