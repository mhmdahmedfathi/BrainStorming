const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

/* AUTHENTICATION ROUTES */
//router.post('/login', login);

router.post('/signup', async(req,res)=>{
    try {
        const { name, username } = req.body;
        
        const result =
          (await User.findOne({ username })) || (await User.findOne({ name }));
  
        if (result) {
          return res.json({
            error: "This user already exists",
          });
        }
        if(req.body.password !== req.body.password2 ){
            return res.json({
                error: "Password doesn't match confirm password",
            });
        }
  
        req.body.password = await bcrypt.hash(req.body.password, 10);
  
        await User.create(req.body);
  
        res.status(201).json({
          success: "User signed up successfully",
        });
      } catch (error) {
        return res.json({
          error: error.message,
        });
      }
    },
);

module.exports = router;