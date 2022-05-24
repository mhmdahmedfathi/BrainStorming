const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

/* AUTHENTICATION ROUTES */
//router.post('/login', login);

router.post("/signup", async (req, res) => {
  try {
    const { name, username, password, password2 } = req.body;

    const result =
      (await User.findOne({ username })) || (await User.findOne({ name }));

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
    return res.json({
      error: error.message,
    });
  }
});

module.exports = router;
