const router = require("express").Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// validation rules for signup data
const signupValidationSchema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().alphanum().min(8).required(),
  password2: Joi.string().alphanum().min(8).required(),
});

// validation rules for login data
const loginValidationSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().alphanum().min(8).required(),
});

/* AUTHENTICATION ROUTES */

// sign up new user route
router.post("/signup", async (req, res) => {
  try {
    // validate the request body
    const { error } = signupValidationSchema.validate(req.body, { abortEarly: false });

    // if the request body is not valid, return an error
    if (error) {
      return res.status(400).json({
        ApiStatus: false,
        error: "Invalid input data. Please make sure that the data you entered is correct.",
      });
    }

    // get the username and password from the request body
    const { username, password, password2 } = req.body;

    // get the user from the database
    let user = await User.findOne({ username });

    // if the user is found, return an error that the username is already taken
    if (user) {
      return res.status(400).json({
        ApiStatus: false,
        error: "Username is already taken",
      });
    }

    // compare between the passwords and return an error if they do not match
    if (password !== password2) {
      return res.status(400).json({
        ApiStatus: false,
        error: "Passwords don't match",
      });
    }

    // hash the password before saving it to the database to protect it
    req.body.password = await bcrypt.hash(password, 10);

    user = await User.create(req.body); // save the new account

    data = {
      username: user.username,
      name: user.name,
    };

    // create a token for the user by using the secret key and signing the username of the user
    const token = jwt.sign({ username: user.username }, "LoginAccess");

    // respond with the token and the user data to the frontend
    res.status(201).json({
      ApiStatus: true, // indicates that their is no error
      success: "User signed up successfully", // success message
      data,
      token,
    });
  } catch (error) {
    // respond with an error if there is an error
    return res.status(500).json({
      ApiStatus: false,
      error: error.message,
    });
  }
});

// login user route
router.post("/login", async (req, res) => {
  try {
    // validate the request body
    const { error } = loginValidationSchema.validate(req.body, { abortEarly: false });

    // if the request body is not valid, return an error
    if (error) {
      return res.status(400).json({
        ApiStatus: false,
        error: "Invalid input data. Please make sure that the data you entered is correct.",
      });
    }

    // get the username and password from the request body
    const { username, password } = req.body;

    // get the user from the database
    const user = await User.findOne({ username });

    // if the user is not found, return an error that there is no user with that username
    if (!user) {
      return res.json({
        ApiStatus: false,
        error: "Invalid username or password",
      });
    }

    // compare the password provided by the user with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    // if the passwords do not match, return an error that the password is incorrect
    if (!isMatch) {
      return res.json({
        ApiStatus: false,
        error: "Invalid username or password",
      });
    }

    data = {
      username: user.username,
      name: user.name,
    };

    // create a token for the user by using the secret key and signing the username of the user
    const token = jwt.sign({ username }, "LoginAccess");

    // respond with the token and the user data to the frontend
    res.status(200).json({
      ApiStatus: true, // indicates that their is no error
      success: "User logged in successfully", // success message
      data,
      token,
    });
  } catch (error) {
    // respond with an error if there is an error
    return res.status(500).json({
      ApiStatus: false,
      error: error.message,
    });
  }
});

module.exports = router;
