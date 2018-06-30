
var colors    = require('colors/safe');
var	logToFile = require('../log/log-to-file');
var querystring = require('querystring');
var http = require('http');

module.exports = 
{	
	fs : require('fs'),
	whitelist : [],
	whitelistFilename : '../whitelist/whitelist.txt',
	endOfLine : require('os').EOL,

	

	checkip : function (req, next) {
	  
	 // var out_text = querystring.escape(JSON.stringify(output));
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log("aqui " + ip);
	var post_data = querystring.stringify({
      'ip' : ip,
      
  	});


	  // An object of options to indicate where to post to
	  var post_options = {
	      host: 'wsulbackend.test',
	      port: '80',
	      path: '/api/checkwhitelist',
	      method: 'POST',	      
	      headers: {
	          'Content-Type': 'application/x-www-form-urlencoded',	   
	          'Content-Length': Buffer.byteLength(post_data),
	          'Authorization' : 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjQ0ZjFlYjZlZjY4MTYwZjQ4ZGZiNjhhNjBlOTlkYjJmY2M3NTMyYjk1ODg4MDgyMThhMWIzYjVlMjgyNzA2YmQ2YmFlODdlMmU5MTIzN2U0In0.eyJhdWQiOiIyIiwianRpIjoiNDRmMWViNmVmNjgxNjBmNDhkZmI2OGE2MGU5OWRiMmZjYzc1MzJiOTU4ODgwODIxOGExYjNiNWUyODI3MDZiZDZiYWU4N2UyZTkxMjM3ZTQiLCJpYXQiOjE1MzAzMTk2OTAsIm5iZiI6MTUzMDMxOTY5MCwiZXhwIjoxNTYxODU1NjkwLCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.i2YigZr5FDg_7HPMvfI09_OGvUJTx5w41IzYDxEJ9uXj2H5Y_V2OA-2bE4qxEtAcDM6gar5H6rc2fUrmMg9DQPjtI_d1wwZ6MV-czsVIZHquFGVOjSSDmA9BXHxWW55DiyZcru0AbnuDNU9K9JvHAErsAbT6EbfqN76SxuaTVLr6hP0GihkIo6cDSXvZJt3jk9G2yIfqJ_NCb2rBGCUr0WZfve4vYaoKlsP0QCbZl75X4ZX4HWEkqCZOHqAW00EM8PvcOPg7hw_AmVTOmgZLHdn2SX8wWnKS2eq3_R_nnCQlmBWqNLCbpWWgZjrdyBoxhDYVXYXRZ_MAYncqB_sg7YXvcS5W2at3gKL4WbenZ9LXDS77lJKqccJjStryS43xz5N6mxvJnAlsCD5c1gC6vUGz48zrpsm3VbVpcqoluEDQwHV5cwN35OY_FUK7ildJItThklXyIXLi5tcVZ9L44LQB_6dHXRaOrkDIOuCfXPQB0H89_K_DpNgelITEZw5Xp5Q_dgxCuEeI-ZeBsAzNOuSNcMyLfjtUVXFKjsI-01wC-76mRQYHa1hV3OZWApPcLGCLb0NBEzwMrtYOHJF1xOp7NblVg_4CyZLzo7i4TJhM5fUNd0luvVgTqalKx8NZAhP3sDqJoYW-EoQtkjPXszaa1yT1Bun5ZCgapnIRGTc',	          
	          'Accept' : 'application/json'
	      }
	  };

	  // Set up the request
	  var post_req = http.request(post_options, function(res) {
	      res.setEncoding('utf8');
	      res.on('data', function (chunk) {
	          //console.log('Response: ' + chunk);
	          next(chunk);
	      });
	  });

	  // post the data
	  //post_req.write(out_text);
	  post_req.write(post_data);
	  post_req.end();

	},

	allowAcces : function (req) {

		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		this.readWhitelistFile();
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
		this.readWhitelistFile();
		console.log('There are ' + this.whitelist.length + ' address(es) on the whitelist');

		if (this.isInWhitelist(ipAddress)) {
			return false;
		}

		this.whitelist.push(ipAddress);
		this.persistWhiteList(ipAddress);

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

	readWhitelistFile : function () {
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
				this.persistWhiteList();
				console.log('whitelist file created: ' + this.whitelistFilename);
			}
		}
	},

	
	persistWhiteList : function  () 
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
