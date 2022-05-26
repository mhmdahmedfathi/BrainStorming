const { verify } = require("jsonwebtoken");
const socket = require("socket.io");
const User = require("../models/User");
const Chat = require("../models/Chat");

let users = []; // array of online users that joined the socket

module.exports = (server) => {
  const io = socket(server, {
    cors: {
      // enable cross origin between the socket and the frontend
      origins: ["*"],
      methods: ["GET", "POST"],
      allowedHeaders: ["AccessToken"],
    },
  });

  io.on("connection", async (socket) => {
    // handling authorization
    const token = socket.handshake.auth["AccessToken"]; // get the token provided from the front

    if (!token) {
      // if their is no token, disconnect from the socket
      socket.disconnect();
      return;
    }

    let user, room;

    try {
      const decoded = verify(token, "LoginAccess"); // compare provided token from the frontend and make sure it contains the needed information
      user = decoded.username; // get the username from the token
    } catch (error) {
      socket.disconnect(); // if the token contains no information, disconnect from the socket
      return;
    }

    // find the user in the database
    user = await User.findOne({ username: user });

    if (!user) {
      socket.disconnect(); // if the user is not found in the database, disconnect from the socket
      return;
    }

    // inform the frontend that the user is connected successfully
    io.to(socket.id).emit("connected");

    // listen for the join room event
    socket.on("joinRoom", async (roomName) => {
      room = roomName;

      // get the room chat messages from the database
      const RoomMessages = await Chat.find({ service: room });

      // add the user to the users array
      users.push({
        socketId: socket.id, // the socket id of the user
        userId: user._id, // the id of the user
        username: user.username, // the username of the user
        room, // the room that the user joined
      });

      // join the socket to the room
      socket.join(room);

      // broadcast to the room that the user joined
      socket.broadcast.to(room).emit("message", {
        type: "joined-room",
        notification: `${user.username} has joined the room`,
        onlineUsers: users.filter((user) => user.room === room).length,
      });

      // send the room messages to the joined user
      io.to(socket.id).emit("message", {
        type: "room-messages",
        messages: RoomMessages,
        onlineUsers: users.filter((user) => user.room === room).length,
      });
    });

    // listen for a new message event
    socket.on("message", async ({ room, message }) => {
      // save the message to the database
      const newMessage = await Chat.create({
        name: user.name,
        username: user.username,
        message,
        service: room,
      });

      // send the new message to the room
      io.to(room).emit("message", {
        type: "new-message",
        message: newMessage,
      });
    });

    // listen for a user leaving the room
    socket.on("disconnect", () => {
      // remove the user from the users array
      users = users.filter((user) => user.socketId !== socket.id);

      // broadcast to the room that the user left
      io.to(room).emit("message", {
        type: "left-room",
        notification: `${user.username} has left the room`,
        onlineUsers: users.filter((user) => user.room === room).length,
      });
    });
  });
};
