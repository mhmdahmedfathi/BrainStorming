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

    console.log("connected", user.name);

    // add identity of user mapped to the socket id
    socket.on("joinRoom", async (roomName) => {
      room = roomName;

      const RoomMessages = await Chat.find({ service: room });

      users.push({
        socketId: socket.id,
        userId: user._id,
        username: user.username,
        room,
      });

      console.log(users);

      socket.join(room);

      socket.broadcast.to(room).emit("message", {
        type: "joined-room",
        notification: `${user.username} has joined the room`,
        onlineUsers: users.filter((user) => user.room === room).length,
      });

      io.to(socket.id).emit("message", {
        type: "room-messages",
        messages: RoomMessages,
        onlineUsers: users.filter((user) => user.room === room).length,
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
      console.log(user.name, "disconnected");
      users = users.filter((user) => user.socketId !== socket.id);
      console.log(users);
      io.to(room).emit("message", {
        type: "left-room",
        notification: `${user.username} has left the room`,
        onlineUsers: users.filter((user) => user.room === room).length,
      });
    });
  });
};
