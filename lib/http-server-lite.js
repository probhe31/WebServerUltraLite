var ecstatic = require('ecstatic'),	
	union = require('union'),
	fs = require('fs');
	

exports.HttpServerLite = exports.HttpServerLite = HttpServerLite;

exports.createServer = function(options)
{
	return new HttpServerLite(options);
};


function HttpServerLite(options)
{
	options = options || {};

	this.headers = options.headers || {};

	this.root = './';
	this.cache = 3600;
	this.contentType = 'application/octet-stream';
	this.ext = 'html';
	this.gzip = true;
	this.autoIndex = true;
	this.showDotfiles = true;
	this.showDir = true;

	var before = options.before ? options.before.slice() : [];

	before.push(function(req, res)
	{
		options.loggerFunction(req, res);
		res.emit('next');
	});

	before.push(ecstatic({
	    root: this.root,
	    cache: this.cache,
	    showDir: this.showDir,
	    showDotfiles: this.showDotfiles,
	    autoIndex: this.autoIndex,
	    defaultExt: this.ext,
	    gzip: this.gzip,
	    contentType: this.contentType,
	    handleError: typeof options.proxy !== 'string'
  	}));

	var serverOptions = 
	{
		before: before,
		headers: this.headers,
		onError: function(err, req, res)
		{
			options.loggerFunction(req, res, err);
			res.end();
		}

		
	};

	this.server = union.createServer(serverOptions);

}


HttpServerLite.prototype.listen = function () {
  this.server.listen.apply(this.server, arguments);
};

HttpServerLite.prototype.close = function () {
  return this.server.close();
};

