// Private members
var blacklist = [];
var fs = require('fs');
var blacklistFilename = null;
var endOfLine = require('os').EOL;

function blockRequests(nameFile, req) {

	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	
	console.log("evaluating " + ip);
	blacklistFilename = nameFile;
	read();

	console.log('There are ' + blacklist.length + ' address(es) on the blacklist');

	if (isInBlacklist(ip)) {
		console.log('Rejecting request from ' + ip + ', path and query was ' + req.originalUrl);
		//response.status(403).send();
		return true;
	}
	else {
		//next();
		console.log("great");
		return false;

	}
}

function addAddress (ipAddress) {

	if (isInBlacklist(ipAddress)) {
		return false;
	}

	blacklist.push(ipAddress);
	persist();

	console.log('IP Address added to blacklist: ' + ipAddress);
	return true;
}

function isInBlacklist (ipAddress) {
	for (var i=0; i!=blacklist.length; i++) {
		if (blacklist[i] == ipAddress) {
			return true;
		}
	}

	return false;
}

function read() {
	try {
		blacklist = fs.readFileSync(blacklistFilename)
			.toString()
			.split(endOfLine)
			.filter(function(row) {
				return row != ''
			});
	}
	catch (error) {
		if (error.code == 'ENOENT') {
			blacklist = [];
			persist();
			console.log('Blacklist file created: ' + blacklistFilename);
		}
	}
}

function persist () {	
	var file = fs.createWriteStream(blacklistFilename);

	file.on('error', function(err) { 
		console.log('Unable to persist blacklist file: ' + err);
	});
	
	blacklist.forEach(function(ipAddress) { 
		file.write(ipAddress + endOfLine); 
	});

	file.end();
}

function logEvent (type, message) {
	/*var msg = type == 'info' ? chalk.green('[express-blacklist] ') : chalk.red('[express-blacklist] ');
	msg += message;

	console.log(msg);*/
}


module.exports = blockRequests;