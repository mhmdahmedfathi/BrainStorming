const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* AUTHENTICATION ROUTES */

router.post("/signup", async (req, res) => {
  try {
    const { username, password, password2 } = req.body;

    const result = await User.findOne({ username });

    if (result) { //if username found return error
      return res.status(400).json({
        ApiStatus: false,
        error: "This user already exists",
      });
    }

    if (password !== password2) { //compare between password and confirm password and return error if not match
      return res.status(400).json({
        ApiStatus: false,
        error: "Passwords don't match",
      });
    }

    req.body.password = await bcrypt.hash(password, 10); //to increase security by encrypting the password with solt 10

    const user = await User.create(req.body); //save the new account

    data = {
      username: user.username,
      name: user.name,
    };

    const token = jwt.sign({ username: user.username }, "LoginAccess"); //make a token by signing information with the secret and pass it to the front

    res.status(201).json({ //return to the front
      ApiStatus: true, //indecates that their is no error
      success: "User signed up successfully", //success message
      data, //data of the user to be used in front
      token, //token to be put in localstorage
    });
  } catch (error) {
    return res.status(500).json({
      ApiStatus: false,
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.json({
        ApiStatus: false,
        error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password); //compare the encrypted password from database with encrypted password provided from the user 

    if (!isMatch) {
      return res.json({
        ApiStatus: false,
        error: "Incorrect password",
      });
    }

    data = {
      username: user.username,
      name: user.name,
    };

    const token = jwt.sign({ username }, "LoginAccess");

    res.status(200).json({
      ApiStatus: true,
      success: "User logged in successfully",
      data,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      ApiStatus: false,
      error: error.message,
    });
  }
});

module.exports = router;
