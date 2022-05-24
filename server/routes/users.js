const router = require("express").Router();
const bcrypt = require("bcrypt");

/* AUTHENTICATION ROUTES */
//router.post('/login', login);

router.post("/signup", async (req, res) => {
  try {
    const { name, username } = req.body;

    const result = await User.findOne({ username });

    if (result) {
      return res.status(400).json({
        error: "This user already exists",
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
