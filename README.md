Node.js is built on non-blocking I/O and the socket.io library has built-in management for reconnection attempts, connection, disconnection events and handling multiple clients simulatenously. What the library doesn't handle are the following:
- **State management:** who sent what, message history, queues of tasks, user roles or routing logic and if something needs to be processed in order,
- **Long running CPU tasks:** tasks like image processing, heavy calculations and compressing files can still block the Node.js event loop,
- **Race conditions / deadlocks in shared state:** Node.js avoids true race conditions thanks to the event loop, but once you do database calls or external I/O you're at risk again. 

In this project I try to handle these conditions as well and provide a better chat application.

---
Before starting the server make sure MongoDB is running by typing the following command if you are on a Manjaro machine:
```
  sudo systemctl status mongodb
```
