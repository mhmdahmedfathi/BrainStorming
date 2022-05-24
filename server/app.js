const express = require("express");
const mongoose = require("mongoose");
const socket = require("socket.io");
const cors = require('cors');
const  Socket  = require("./utils/Socket");
const app = express();


const activeUsers = new Set();
const PORT = process.env.PORT || 8080;

async function db() {
  await mongoose.connect("mongodb://localhost:27017/gp");
  console.log("Connected to DB");
}

db().catch((err) => console.log(err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/users", require("./routes/users"));
app.use("/chat", require("./routes/chat"));

const server = app.listen(PORT, (err) => {
  if (err) return console.error(err);
  console.log(`Server started listening at port ${PORT}`);
});

const io = socket(server);

io.on("joinroom",Socket.connection)

