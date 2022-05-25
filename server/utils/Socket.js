const { verify } = require("jsonwebtoken");
const socket = require("socket.io");
const User = require("../models/User");
const Chat = require("../models/Chat");

let users = [];

module.exports = (server) => {
  const io = socket(server, {
    cors: {
      origins: ["*"],
      methods: ["GET", "POST"],
      allowedHeaders: ["AccessToken"],
    },
  });

  io.on("connection", async (socket) => {
    console.log("connected", socket.id);

    // handling authorization
    const token = socket.handshake.auth["AccessToken"];
    if (!token) {
      socket.disconnect();
      return;
    }

    let user, room;

    try {
      const decoded = verify(token, "LoginAccess");
      user = decoded.username;
    } catch (error) {
      socket.disconnect();
      return;
    }

    user = await User.findOne({ username: user });

    // add identity of user mapped to the socket id
    socket.on("joinRoom", async (roomName) => {
      room = roomName;

      const RoomMessages = await Chat.find({ service: room });

      users.push({
        socketId: socket.id,
        userId: user._id,
        username: user.username,
      });

      socket.join(room);

      socket.broadcast.to(room).emit("message", {
        type: "joined-room",
        notification: `${user.username} has joined the room`,
      });

      io.to(socket.id).emit("message", {
        type: "room-messages",
        messages: RoomMessages,
      });
    });

    //message on the desired room
    socket.on("message", async ({ room, message }) => {
      console.log("new message");
      const newMessage = await Chat.create({
        name: user.name,
        username: user.username,
        message,
        service: room,
      });

      io.to(room).emit("message", {
        type: "new-message",
        message: newMessage,
      });
    });

    // event fired when the chat room is disconnected
    socket.on("disconnect", () => {
      console.log("disconnected");
      users = users.filter((user) => user.socketId !== socket.id);
      console.log(users);
      io.to(room).emit("message", {
        type: "left-room",
        notification: `${user.username} has left the room`,
      });
    });
  });
};
