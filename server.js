import { createServer } from 'net';

var server = createServer((socket) => {
    socket.end("Good Bye \n");
}).on('error', err => {
    console.log(err);
});


server.listen(50042, () => {
    const address = server.address();
    console.log("Opened server on:", address);
});