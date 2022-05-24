const { verify } = require("jsonwebtoken");
const User = require("../models/User");
const Chat = require("../models/Chat");

let users = [];

module.exports = {
  async connection(socket) {
    console.log("connected");
    // handling authorization
    const token = socket.handshake.auth["AccessToken"];
    if (!token) {
      socket.disconnect();
      return;
    }

    let user;

    try {
      const decoded = verify(token, "LoginAccess");
      user = decoded.username;
    } catch (error) {
      socket.disconnect();
      return;
    }

    user = await User.findOne(user._id);

    // add identity of user mapped to the socket id
    socket.on("joinRoom", async ({room},callback) => {
      console.log({ user, room });
      let RoomMessages = await Chat.find({
        service: room,
      });

      callback(RoomMessages)
      users.push({
        socketId: socket.id,
        userId: user._id,
      });

    });
    

    //message on the desired room
    socket.on("message", async ({room, message},callback) => {

      const newMessage  =  await Chat.create({
        name: user.name,
        username: user.username,
        message,
        service: room,
      });
      callback(newMessage)
    });

    // event fired when the chat room is disconnected
    socket.on("disconnect", () => {
      users = users.filter((user) => user.socketId !== socket.id);
    });
  },
};
