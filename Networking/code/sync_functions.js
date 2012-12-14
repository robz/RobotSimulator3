var statusDiv;

function writeToTextField(data) {
    var jsonObj = JSON.parse(data);
    if (jsonObj["status"] == "ripe") {
        try {
            network_object = JSON.parse(decode(jsonObj.serverText));
            dealWithUpdate();
        } catch(e) {
            console.log("heh looks like there was some error while parsing stuff from the server. ignored.");
        }
    }
    
    statusDiv.innerHTML = "<p>"+data+"</p>"+statusDiv.innerHTML;	
    setTimeout("requestFile(writeToTextField)", 10);
}

function writeBack(obj) {
    postFile("data.txt", true, encode(JSON.stringify(obj)));
    postFile("id.txt", true, ""+myID);
}

function requestFile(callback) {
    var text = encode(JSON.stringify(network_object))+"&id="+myID;
    getFile("data.php?text="+text, callback, true);
}

function encode(text) {
    return text.replace(/\n/g, "<br>").replace(/"/g,"<apost>").replace(/&/g,"<amp>");
}

function decode(text) {
    return text.replace(/<br>/g, "\n").replace(/<apost>/g, "\"").replace(/<amp>/g, "&");
}
