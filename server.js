const app = require('express')();
const express = require('express');
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;
const io = require('socket.io')(server);

const {
  joinUser,
  removeUser,
  getUsers,
  getUserRoom,
  getAllRooms,
} = require('./public/users.js');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.use(express.static(__dirname + '/public'));
server.listen(3000, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});

let thisRoom = '';
io.on('connection', (socket) => {
  socket.on('join room', (data) => {
    let Newuser = joinUser(socket.id, data.username, data.roomName);
    socket.emit('send data', {
      id: socket.id,
      username: Newuser.username,
      roomname: Newuser.roomname,
    });
    let allUsers = getAllRooms();
    io.emit('all rooms', allUsers);

    socket.join(Newuser.roomname);
    let userlist = getUsers(Newuser.roomname);
    io.to(Newuser.roomname).emit('in room', userlist);
  });

  socket.on('chat message', (msg) => {
    thisRoom = msg.room;
    io.to(thisRoom).emit('chat message', { msg: msg, id: socket.id });
  });
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    const room = getUserRoom(socket.id);
    const user = removeUser(socket.id);
    if (user) {
      console.log(user.username + ' has left');
    }
    let userlist = getUsers(room);
    io.to(room).emit('in room', userlist);
    let allusers = getAllRooms();
    io.emit('all rooms', allusers);
  });
});
