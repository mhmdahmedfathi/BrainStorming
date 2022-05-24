const moment = require('moment');
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        maxLength: 40,
        required: true
    },
    username: {
        type: String,
        maxLength: 100,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    services:{
        type:String,
        required:true
    },
    time:{
        type:String
    }

}, { timestamps: true });


chatSchema.pre("save", async function(){
    this.time = moment().format('MMMM Do YYYY, h:mm:ss a');
})


module.exports = mongoose.model('chat', chatSchema);