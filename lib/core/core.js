var http = require('http');
var RoutingStream = require('./routing-stream');
var core = exports;
var whiteList = require('../whitelist/white-list');


core.createServer = function (options) {
  var isArray = Array.isArray(options.after);

  if (!options) {
    throw new Error('options is required to create a server');
  }

  //req:incomingMessage / res:serverResponse
  function requestHandler(req, res) {    

    whiteList.checkip(req, function next(result){

      console.log(result);
      if(result=='true'){

          var routingStream = new RoutingStream({
            before: options.before,
            buffer: options.buffer,      
            after: isArray && options.after.map(function (After) {
            return new After;
          }),
            request: req,
            response: res,
            limit: options.limit,
            headers: options.headers
          });

          routingStream.on('error', function (err) {
            var fn = options.onError || core.errorHandler;
            fn(err, routingStream, routingStream.target, function () {
              routingStream.target.emit('next');
            });
          });

          req.pipe(routingStream);


        }else
        {

          req.url = "/403.html"
          var routingStream = new RoutingStream({
            before: options.before,
            buffer: options.buffer,      
            after: isArray && options.after.map(function (After) {
            return new After;
          }),
            request: req,
            response: res,
            limit: options.limit,
            headers: options.headers
          });

          routingStream.on('error', function (err) {
            var fn = options.onError || core.errorHandler;
            fn(err, routingStream, routingStream.target, function () {
              routingStream.target.emit('next');
            });
          });

          req.pipe(routingStream);
          
          console.log("ACCESS ERROR " + req);
          
        }
    });


    
    //console.log("ipconectado " + ip);


    
  }
  
  return http.createServer(requestHandler);
};

core.errorHandler = function error(err, req, res) {
  if (err) {
    (this.res || res).writeHead(err.status || 500, err.headers || { "Content-Type": "text/plain" });
    (this.res || res).end(err.message + "\n");
    return;
  }

  (this.res || res).writeHead(404, {"Content-Type": "text/plain"});
  (this.res || res).end("Not Found\n");
};
