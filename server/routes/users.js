const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt =  require("jsonwebtoken")

/* AUTHENTICATION ROUTES */
//router.post('/login', login);

router.post("/signup", async (req, res) => {
  try {
    const { name, username, password, password2 } = req.body;

    const result =
      (await User.findOne({ username }));

    if (result) {
      return res.json({
        Apistatues:false,
        error: "This user already exists",
      });
    }
    if (req.password !== req.password2) {
      return res.json({
        Apistatues:false,
        error: "Passwords don't match",
      });
    }

    req.body.password = await bcrypt.hash(password, 5);

    const user = await User.create(req.body);
    
    data = {
        username:user.username,
        name:user.name
    }

    const token = jwt.sign({_id:user._id}, "LoginAccess" )

    
    res.status(201).json({
        Apistatues:true,
        success: "User signed up successfully",
        data:data,
        token:token
    });
  } catch (error) {
    return res.json({
      error: error.message,
    });
  }
});

module.exports = router;
