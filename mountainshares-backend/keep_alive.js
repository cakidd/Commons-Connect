var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write("MountainShares Payment Server - I'm alive");
    res.end();
}).listen(8080);

console.log('Keep-alive server running on port 8080');
