import http from "http";

const webApp = http.createServer((requestObj, responseObj) => {
    const requestPath = requestObj.url;

    if (requestPath === "/") {
        responseObj.writeHead(200, {
            "Content-Type": "text/html"
        });

        responseObj.end("<h1>Welcome to Node.js Web Server!</h1>");
    }
    else if (requestPath === "/about") {
        responseObj.writeHead(200, {
            "Content-Type": "text/html"
        });

        responseObj.end("<h1>About Us</h1><p>This is a WEB server.</p>");
    }
    else {
        responseObj.writeHead(404, {
            "Content-Type": "text/html"
        });

        responseObj.end("<h1>404 - Page Not Found</h1>");
    }
});

const SERVER_PORT = 3000;

webApp.listen(SERVER_PORT, () => {
    console.log(`Server running at http://localhost:${SERVER_PORT}`);
});