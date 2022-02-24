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
