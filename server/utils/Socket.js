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
    socket.on("joinRoom", async (room) => {
      console.log({ user, room });
      let RoomMessages = await Chat.find({
        service: room,
      });
      socket.send(
        JSON.stringify({
          RoomMessages,
        })
      );
      users.push({
        socketId: socket.id,
        userId: user._id,
      });

      console.log(users);
    });

    //message on the desired room
    socket.on("message", async (room, message) => {
      console.log({ user, room });

      await Chat.create({
        name: user.name,
        username: user.username,
        message,
        service: room,
      });
    });

    // event fired when the chat room is disconnected
    socket.on("disconnect", () => {
      users = users.filter((user) => user.socketId !== socket.id);
    });
  },
};
