const { verify } = require("jsonwebtoken");
const socket = require("socket.io");
const User = require("../models/User");
const Chat = require("../models/Chat");

let users = []; //array of online users that joined the socket

module.exports = (server) => {
  const io = socket(server, {
    cors: { // enable cross origin between the socket and the front
      origins: ["*"],
      methods: ["GET", "POST"],
      allowedHeaders: ["AccessToken"],
    },
  });

  io.on("connection", async (socket) => {
    // handling authorization
    const token = socket.handshake.auth["AccessToken"]; //get the token provided from the front 
    if (!token) { //if their is noo token so he needs to login first so disconnect him from the socket
      socket.disconnect();
      return;
    }

    let user, room;

    try {
      const decoded = verify(token, "LoginAccess"); //compare provided token from the front and make sure it contains information needed
      user = decoded.username; //get the username from the token
    } catch (error) {
      socket.disconnect(); //if the token contains no information
      return;
    }

    user = await User.findOne({ username: user });


    io.to(socket.id).emit("connected");

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
      users = users.filter((user) => user.socketId !== socket.id);
      io.to(room).emit("message", {
        type: "left-room",
        notification: `${user.username} has left the room`,
        onlineUsers: users.filter((user) => user.room === room).length,
      });
    });
  });
};
