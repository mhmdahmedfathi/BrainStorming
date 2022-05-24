class Socket {
    users = [];
    connection(client) {
      // event fired when the chat room is disconnected
      client.on("disconnect", () => {
        this.users = this.users.filter((user) => user.socketId !== client.id);
      });
      // add identity of user mapped to the socket id
      client.on("services", (userId) => {
        this.users.push({
          socketId: client.id,
          userId: userId,
        });
      });
    }
  
   
  }
  module.exports = new Socket();
