var whitelist = [];
var fs = require('fs');
var whitelistFilename = null;
var endOfLine = require('os').EOL;
var colors    = require('colors/safe');
var	logToFile = require('../log/log-to-file');

function allowAcces(nameFile, req) {

	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	
	console.log("evaluating " + ip);
	whitelistFilename = nameFile;
	read();

	console.log('There are ' + whitelist.length + ' address(es) on the whitelist');

	if (isInWhitelist(ip)) {
		return true;
	}
	else 
	{
		var message = 'Rejecting request from ' + ip + ', path and query was ' + req.originalUrl;
		console.log(message);
		logToFile(message);
		return false;
	}
}

function addAddress (ipAddress) {

	if (isInwhitelist(ipAddress)) {
		return false;
	}

	whitelist.push(ipAddress);
	persist();

	console.log('IP Address added to whitelist: ' + ipAddress);
	return true;
}

function isInWhitelist (ipAddress) {
	for (var i=0; i!=whitelist.length; i++) {
		if (whitelist[i] == ipAddress) {
			return true;
		}
	}

	return false;
}

function read() {
	try {
		whitelist = fs.readFileSync(whitelistFilename)
			.toString()
			.split(endOfLine)
			.filter(function(row) {
				return row != ''
			});
	}
	catch (error) {
		if (error.code == 'ENOENT') {
			whitelist = [];
			persist();
			console.log('whitelist file created: ' + whitelistFilename);
		}
	}
}

function persist () {	
	var file = fs.createWriteStream(whitelistFilename);

	file.on('error', function(err) { 
		console.log('Unable to persist whitelist file: ' + err);
	});
	
	whitelist.forEach(function(ipAddress) { 
		file.write(ipAddress + endOfLine); 
	});

	file.end();
}

module.exports = allowAcces;