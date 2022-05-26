const moment = require("moment");
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 3,
      maxLength: 40,
      required: true,
    },
    username: {
      type: String,
      maxLength: 100,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    time: {
      type: String,
    },
  },
  { timestamps: true }
);

// pre-save hook to set the time of the message
chatSchema.pre("save", async function () {
  this.time = moment().format("Do MMM YYYY, hh:mm A"); // adds the date to every message
});

module.exports = mongoose.model("chat", chatSchema);
