const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const path = require("node:path");
const io = new Server(server);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
   console.log('A user connected');
   socket.on('chat message', (data) => {
       console.log('message: ' + data);
       io.emit('chat message', data);
   });

   socket.on('disconnect', () => {
       console.log('User disconnected');
   });
});

server.listen(3000, () => {
    console.log('Listening on port 3000');
});