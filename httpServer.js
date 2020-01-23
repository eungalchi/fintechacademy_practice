var http = require("http");

http.createServer(function (req, res) {
    console.log(req);
	var body = "hello Server";
	res.setHeader('Content-Type', 'text/html; charset=utf-8');
	res.end("안녕하세요")
}).listen(3000);

console.log("서버가 실행중입니다.")