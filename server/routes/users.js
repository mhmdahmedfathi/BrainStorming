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
      return res.json({
        error: "This user already exists",
      });
    }
    if (req.password !== req.password2) {
      return res.json({
        error: "Passwords don't match",
      });
    }

    req.body.password = await bcrypt.hash(password, 10);

    await User.create(req.body);

    res.status(201).json({
      success: "User signed up successfully",
    });
  } catch (error) {
    return res.status(500).json({
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
        error: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        error: "Incorrect password",
      });
    }

    const token = jwt.sign({ username }, "LoginAccess");

    res.status(200).json({
      success: "User logged in successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
