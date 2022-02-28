# Oprec_Admin_NCC_Second_Assignment
# Simple Live Chat Application With Socket.io

## Definisi
<em>Socket.IO is a library that enables real-time, bidirectional and event-based communication between the browser and the server.</em>
<br>
## Install Dependencies
Install node.js pada system terlebih dahulu disini https://nodejs.org/en/, lalu tambahkan package berikut:
```
npm init
npm install socket.io socket.io-client
npm install express@4
```
## Membuat tampilan
Untuk membuat tampilan pada aplikasi ini, digunakan basic HTML dan CSS sebagai berikut: 
```HTML
<!DOCTYPE html>
<html>
  <head>
    <title>Live Chat Socket.io</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <div class="header">
      <h1>NCC Live Chat</h1>
    </div>
    <div class="roomname">
      <h1 id="room">Roomname: </h1>
    </div>
    <div class="users">
      <h1 class="inthisroom">In this room:</h1>
      <ul id="user"></ul>
    </div>
    <div class="box">
      <ul id="messages"></ul>
    </div>
    <div class="rooms">
      <h1 class="roomavailable">Room Available:</h1>
      <ul id="room-a"></ul>
    </div>
    <form id="form" action="">
      <input id="input" autocomplete="off" /><button class="button">
        Send
      </button>
    </form>
  </body>
</html>
```
Tambahakan script dibawah ini agar socket.io dapat dijalankan
```HTML
<script src="/socket.io/socket.io.js"></script>
```
Untuk melihat file CSS terdapat pada folder /public/styles.css
<br>
## Client-Side
```js
let userName = prompt('Masukkan nama');
let room = prompt('Masukkan nama room');
let ID = '';
var socket = io();
var roomname = document.getElementById('room');
var userlist = document.getElementById('user');
var roomlist = document.getElementById('room-a');
roomname.textContent += room;
```
Pada homepage web yang dibuat, dibutuhkan sebuah username dan roomname dari user. Username dan roomname akan digunakan untuk tampilan halaman sekaligus fungsionalitas dari aplikasi. Hal tersebut dapat dilakukan dengan menambahkan code diatas.
<br>
```js
socket.emit('join room', { username: userName, roomName: room });
```
Untuk emitting-event username dan roomname ke server-side, socket.emit dapat digunakan seperti pada code diatas.
<br>
<br>
socket.on berfungsi untuk event-handler baik pada server ataupun client. Pada aplikasi ini terdapat beberapa event yang harus dihandle pada client seperti menerima chat, melihat user yang ada pada room, serta melihat room yang tersedia. Code berikut digunakan untuk kebutuhan fungsionalitas tersebut.
```js
socket.on('send data', (data) => {
  ID = data.id;
});

socket.on('all rooms', (data) => {
  while (roomlist.firstChild) {
    roomlist.removeChild(roomlist.lastChild);
  }
  for (let i = 0; i < data.length; i++) {
    var item = document.createElement('li');
    item.textContent = data[i];
    roomlist.appendChild(item);
  }
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('in room', (data) => {
  while (userlist.firstChild) {
    userlist.removeChild(userlist.lastChild);
  }
  for (let i = 0; i < data.length; i++) {
    var item = document.createElement('li');
    item.textContent = data[i].username;
    userlist.appendChild(item);
  }
  window.scrollTo(0, document.body.scrollHeight);
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', {
      value: input.value,
      user: userName,
      room: room,
    });
    input.value = '';
  }
});

socket.on('chat message', function (msg) {
  var item = document.createElement('li');
  item.innerHTML =
    '<strong>' + msg.msg.user + '</strong>' + ' : ' + msg.msg.value;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
```
## Server-side
```js
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
```
Tambahkan code diatas sebagai requirement yang dibutuhkan pada server.js.
<br>
```js
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.use(express.static(__dirname + '/public'));
server.listen(3000, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});
```
Untuk menjalankan server pada port tertentu, gunakan code diatas.
<br>
```js
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
```
Pada saat user terhubung ke website, maka dibutuhkan beberapa event-handling dari client untuk mendapatkan data dari user tersebut. Untuk menyimpan data user dan room yang ada, users.js dibuat untuk melakukan penyimpanan data-data yang masuk ke website berupa username dan roomname.
<br>
Saat user mengirimkan chat dari client, maka isi pesan yang dikirimkan ke server yang nantinya akan dikirimkan kembali ke client dengan room yang sama.
<br>
Begitu pula pada saat user disconnect, maka dibutuhkan pula sebuah event-handler untuk menghapus data user tersebut.
```js
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
```
Seluruh fungsionalitas tersebut dapat dijalankan dengan code diatas.
## users.js
users.js berfungsi sebagai penyimpanan data users dan room yang ada. users.js juga menghandle beberapa fungsi seperti menghapus user, mengambil informasi user, dan mengambil informasi room yang ada.
```js
let users = [];
function joinUser(socketId, userName, roomName) {
  const user = {
    socketID: socketId,
    username: userName,
    roomname: roomName,
  };
  users.push(user);
  return user;
}

function removeUser(id) {
  const getID = (users) => users.socketID === id;
  const index = users.findIndex(getID);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function getUsers(room) {
  let newUsers = [];
  for (let i = 0; i < users.length; i++)
    if (users[i].roomname == room) newUsers.push(users[i]);
  return newUsers;
}

function getUserRoom(id) {
  const getID = (users) => users.socketID === id;
  const index = users.findIndex(getID);
  if (index !== -1) return users[index].roomname;
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function getAllRooms() {
  let rooms = [];

  for (let i = 0; i < users.length; i++) {
    rooms.push(users[i].roomname);
  }

  return rooms.filter(onlyUnique);
}
module.exports = { joinUser, removeUser, getUsers, getUserRoom, getAllRooms };
```
# Penugasan
* Penugasan bersifat kelompok (2 orang, diplotting-kan silahkan cek drive camin)
* Aplikasi yang dibuat terdapat 2 fitur wajib yaitu live chat dan shared whiteboard (https://socket.io/demos/whiteboard)
* Terdapat 2 endpoint untuk sistem shared whiteboard
  - 1 endpoint untuk whiteboard colaborative dimana semua user bisa manggambar sesukanya.
  - 1 endpoint untuk broadcast whiteboard dimana hanya 1 orang yang bisa menulis sementara lainya hanya bisa melihat.
* Aplikasi juga harus ada 2 fitur tambahan (bebas selain fitur livechat dan whiteboard). Contoh: Tiap room dikasih password.
* Buatlah juga markdown yang menjelaskan fitur dan pengggunaan aplikasi yang kamu buat.
* Implementasi fitur tambahan diperbolehkan.
* Hasil akhir penugasan berupa repository github.
* Lakukan commit secara berkala.
* Jadikan google sebagai teman kalian.

## Penilaian Kelompok
* Implementasi Fitur Penugasan.
* Kreativitas.
* Desain.

## Penilaian Individu
* Kontribusi terhadap kelompok melalui commit pada repository.
* Pemahaman.
* Penyampaian.
