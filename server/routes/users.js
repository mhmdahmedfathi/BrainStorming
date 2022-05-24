const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* AUTHENTICATION ROUTES */

router.post("/signup", async (req, res) => {
  try {
    const { name, username, password, password2 } = req.body;

    const result = await User.findOne({ username });

    if (result) {
      return res.status(400).json({
        ApiStatus: false,
        error: "This user already exists",
      });
    }

    if (password !== password2) {
      return res.status(400).json({
        ApiStatus: false,
        error: "Passwords don't match",
      });
    }

    req.body.password = await bcrypt.hash(password, 10);

    const user = await User.create(req.body);

    data = {
      username: user.username,
      name: user.name,
    };

    const token = jwt.sign({ username: user.username }, "LoginAccess");

    res.status(201).json({
      ApiStatus: true,
      success: "User signed up successfully",
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

    const isMatch = await bcrypt.compare(password, user.password);

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
