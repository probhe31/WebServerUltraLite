
var colors    = require('colors/safe');
var	logToFile = require('../log/log-to-file');


module.exports = 
{	
	fs : require('fs'),
	whitelist : [],
	whitelistFilename : '../whitelist/whitelist.txt',
	endOfLine : require('os').EOL,

	allowAcces : function (req) {
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		this.read();
		if (this.isInWhitelist(ip)) {
			return true;
		}
		else 
		{
			var message = 'Rejecting request from ' + ip + ', path and query was ' + req.originalUrl;
			console.log(message);
			logToFile(message);
			return false;
		}
	},

	addAddress : function (ipAddress) {
		this.read();
		console.log('There are ' + this.whitelist.length + ' address(es) on the whitelist');

		if (this.isInWhitelist(ipAddress)) {
			return false;
		}

		this.whitelist.push(ipAddress);
		this.persist(ipAddress);

		console.log('IP Address added to whitelist: ' + ipAddress);
		return true;
	},

	isInWhitelist : function  (ipAddress) {
		for (var i=0; i!=this.whitelist.length; i++) {
			if (this.whitelist[i] == ipAddress) {
				return true;
			}
		}

		return false;
	},

	read : function () {
		try {
			this.whitelist = this.fs.readFileSync(this.whitelistFilename)
				.toString()
				.split(this.endOfLine)
				.filter(function(row) {
					return row != ''
				});
		}
		catch (error) {
			if (error.code == 'ENOENT') {
				this.whitelist = [];
				this.persist();
				console.log('whitelist file created: ' + this.whitelistFilename);
			}
		}
	},

	
	persist : function  () 
	{
		var self = this;

		var file = this.fs.createWriteStream(this.whitelistFilename);

		file.on('error', function(err) { 
			console.log('Unable to persist whitelist file: ' + err);
		});
		
		this.whitelist.forEach(function(ipAddress) { 		
			file.write(ipAddress + self.endOfLine); 
		});

		file.end();
		
		file.on('finish', function(){process.exit();});
	}

}
