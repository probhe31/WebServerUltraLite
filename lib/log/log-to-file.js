var fs = require('fs');
var limitFileSizeInBytes=104857600;

function appendZeroToLength(value, length) {
	var correctValue = value;
	if (length > value.toString().length) {
		if (value !== 'undefined' && value.toString().length != length) {
			// Add zero to correct length.
			for (var i = 0; i < length - value.toString().length; i++) {
				correctValue = '0' + correctValue;
			}
		}
	}
	return correctValue;
}

function getEntryLog(dateText, timeText) {
	
	var nowText = '['+ dateText +', '
					 + timeText + ']';
	return nowText;
}

function getDateText(dateObj)
{
	return appendZeroToLength(dateObj.getUTCFullYear(), 4) + '-'
		+ appendZeroToLength(dateObj.getUTCMonth() + 1, 2) + '-'
		+ appendZeroToLength(dateObj.getUTCDate(), 2) ;
}

function getTimeText(dateObj)
{
	return appendZeroToLength(dateObj.getUTCHours(), 2) + ':'
		+ appendZeroToLength(dateObj.getUTCMinutes(), 2) + ':'
		+ appendZeroToLength(dateObj.getUTCSeconds(), 2) + '.'
		+ appendZeroToLength(dateObj.getUTCMilliseconds(), 4) + ' UTC';
}

function formatBytes(a,b)
{
	if(0==a)
		return"0 Bytes";

	var c=1024,
		d=b||2,
		e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],
		f=Math.floor(Math.log(a)/Math.log(c));
	return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}


function getFileSize(file)
{
	try 
	{
	  	var stats = fs.statSync(file);
    	var fileSizeInBytes = stats["size"];
    	return fileSizeInBytes;
	} catch (err) {
	  	console.log("can't found log file");	
	}
}

function logToFile(text) {

	var now = new Date();
	var dateText = getDateText(now);
	var timeText = getTimeText(now);

	// Define file name.
	var filename = '../log/'+dateText+'.txt';
	
	// Define log text.
	var logText = getEntryLog(dateText, timeText) + ' -> ' + text + '\r\n';
	// Save log to file.
	fs.appendFile(filename, logText, 'utf8', function(err) {
		if (err) {
			// If error - show in console.
			console.log(getDateText() + ' -> ' + err);
		}
	});


}

module.exports = logToFile;
