// libraries imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Socket = require("./utils/Socket");

// create instance of express
const app = express();

// get port number
const PORT = process.env.PORT || 8080;

// connect to database
async function db() {
  await mongoose.connect("mongodb://localhost:27017/gp");
  console.log("Connected to DB");
}
db().catch((err) => console.log(err));

// enable body parsing to get data from the frontend
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// enable cors (cross origin resource sharing)
app.use(cors());

// get the routes of the user
app.use("/users", require("./routes/users"));

// listen to the server
const server = app.listen(PORT, (err) => {
  if (err) return console.error(err);
  console.log(`Server started listening at port ${PORT}`);
});

// pass express instance to the socket
Socket(server);
