const User = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator"); // checking validation result by express validator

module.exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log(req.body);

  const { fullname, email, password } = req.body;
  const hashedPassword = await User.hashPassword(password);
  const user = await userService.createUser({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashedPassword,
  });
  const token = user.generateAuthToken();
  return res.status(201).json({ token, user });
};

module.exports.loginUser = async (req, res, next) => {};