const User = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator"); // checking validation result by express validator
const BlacklistToken = require("../models/blackListToken.model");

module.exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log(req.body);

  const { fullname, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(401).json({ message: "User already exists." });
  }
  const hashedPassword = await User.hashPassword(password);
  const user = await userService.createUser({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashedPassword,
  });
  const token = user.generateAuthToken();
  return res.status(201).json({ token, user, success: true });
};

module.exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ message: "Password incorrect.", success: false });
  }
  const token = user.generateAuthToken();
  res.cookie("token", token);
  return res.status(200).json({ token, user, success: true });
};

module.exports.getUserProfile = async (req, res, next) => {
  return res.status(200).json(req.user);
};

module.exports.logoutUser = async (req, res, next) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];
  await BlacklistToken.create({ token });
  res.status(200).json({ message: "Logged out" });
};
