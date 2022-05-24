const User = require("../models/User");

const users = [];

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
      const decoded = jwt.verify(token, "LoginAccess");
      user = decoded.username;
    } catch (error) {
      socket.disconnect();
      return;
    }

    user = await User.findOne(user._id);

    // event fired when the chat room is disconnected
    socket.on("disconnect", () => {
      users = users.filter((user) => user.socketId !== socket.id);
    });

    // add identity of user mapped to the socket id
    socket.on("joinRoom", (room) => {
      console.log({ user, room });

      users.push({
        socketId: socket.id,
        userId: user._id,
      });

      console.log(users);
    });
  },
};
