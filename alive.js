import http from "http";

http.createServer((res, req) => {
	res.write("I'm alive");
	res.end();
}).listen(3000);