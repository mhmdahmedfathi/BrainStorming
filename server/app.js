const express = require("express");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 8080;

async function db() {
  await mongoose.connect("mongodb://localhost:27017/gp");
  console.log("Connected to DB");
}

db().catch((err) => console.log(err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/users", require("./routes/users"));
app.use("/chat", require("./routes/chat"));

app.listen(PORT, (err) => {
  if (err) return console.error(err);
  console.log(`Server started listening at port ${PORT}`);
});
