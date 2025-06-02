const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const path = require("node:path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const io = new Server(server, {
    connectionStateRecovery: true
});

mongoose.connect('mongodb://localhost:27017/', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));

const messageSchema = new mongoose.Schema({
   content: String,
   sender: String,
   timestamp: {type: Date, default: Date.now}
});

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
});

const Message = mongoose.model("Message", messageSchema);
const User = mongoose.model("User", userSchema);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.json());

app.post('/register', async (req, res) => {
   const { username, password } = req.body;
   try {
       const hashedPassword = await bcrypt.hash(password, 10);
       const user = new User({username, password: hashedPassword});
       await user.save();
       res.status(201).json({message: 'User registered successfully.'});
   } catch (error) {
       res.status(400).json({message: 'Registration failed.', error: error.message});
   }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if(!user) return res.status(401).json({message: 'Invalid credentials.'});
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(401).json({message: 'Invalid credentials.'});
        const token = jwt.sign({username: user.username}, 'secret_key', {expiresIn: '1h'});
        res.json({message: 'Login successful', token});
    } catch (error) {
        res.status(500).json({message: 'Login failed.', error: error.message});
    }
})

io.use((socket, next) => {
   const token = socket.handshake.auth.token; // <---
   try {
       const decoded = jwt.verify(token, 'secret_key');
       socket.username = decoded.username;
       next();
   } catch (error) {
       next(new Error('Unauthorized'));
   }
});

io.on('connection', (socket) => {
   console.log(`A ${socket.username} connected`);
   socket.on('chat message', (data) => {
       const newMessage = new Message({content: data, sender: socket.username});
       try {
           newMessage.save();
           io.emit('chat message', data);
       } catch (error) {
           console.error(error);
       }
   });

   socket.on('load history', async () => {
       try {
           const messages = await Message.find().sort({ timestamp: -1 }).limit(50).exec(); // Gets the last 50 messages newest first
           socket.emit('history loaded', messages.reverse()); // Send to the client oldest first
       } catch (error) {
           console.error(error);
       }
   })

   socket.on('disconnect', () => {
       console.log(`${socket.username} disconnected`);
   });
});

server.listen(3000, () => {
    console.log('Listening on port 3000');
});