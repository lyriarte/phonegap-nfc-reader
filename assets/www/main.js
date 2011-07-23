/*global Ndef */
var tagMimeType = "text/pg";

function template(record) {
    var recordType = Ndef.bytesToString(record.type),
    payload;

    if (recordType === "T") {
        var langCodeLength = record.payload[0],
        text = record.payload.slice((1 + langCodeLength), record.payload.length);

        payload = Ndef.bytesToString(text);

    } else if (recordType === "U") {
        var url = Ndef.bytesToString(record.payload);
        payload = "<a href='" + url + "'>" + url + "<\/a>";

    } else {
        payload = Ndef.bytesToString(record.payload);

    }

    return ("record type: <b>" + recordType + "<\/b>" +
    "<br/>" + payload
    );
}

function clearScreen() {
    document.getElementById("tagContents").innerHTML = "";
}

function showText(text) {
    document.getElementById("tagContents").innerHTML = text;    
}

function showInstructions() {
    document.getElementById("tagContents").innerHTML =
    "<div id='instructions'>" +
    " <p>Scan a tag to begin.<\/p>" +
    " <p>Expecting Mime Media Tags with a type of " + tagMimeType + ".<\/p>" +
    " <p>Use the menu button to clear the screen.<\/p>" +
    "<\/div>";
}

function myNfcListener(nfcEvent) {
    console.log(JSON.stringify(nfcEvent.tagData));
    clearScreen();

    var records = nfcEvent.tagData,
    display = document.getElementById("tagContents");
    display.appendChild(document.createTextNode(
    "Scanned a NDEF tag with " + records.length + " record" + ((records.length === 1) ? "": "s"))
    );

    for (var i = 0; i < records.length; i++) {

        var record = records[i],
        p = document.createElement('p');

        p.innerHTML = template(record);
        display.appendChild(p);
    }
    navigator.notification.vibrate(100);
}

var ready = function() {

    function win() {
        console.log("Listening for tags with mime type " + tagMimeType);
    }

    function fail(reason) {
        navigator.notification.alert(reason, function() {}, "There was a problem");
    }

    navigator.nfc.addMimeTypeListener(tagMimeType, myNfcListener, win, fail);
    
    navigator.nfc.addNdefListener(
        function() {
            showText("This is an NDEF tag but doesn't match the mime type " + tagMimeType + ".");
        },
        function() {
            console.log("Listening for NDEF tags.");
        },
        fail
    );
    
    navigator.nfc.addNdefFormattableListener(
        function() {
            showText("This tag is formatable");
        },
        function() {
            console.log("Listening for tags that can be formatted.");
        },
        fail
    );

    showInstructions();
    
};

document.addEventListener("menubutton", showInstructions, false);

document.addEventListener('deviceready', ready, false);