const captainModel = require("../models/captain.model");
const captain = require("../models/captain.model");
const captainService = require("../services/captain.service");
const { validationResult } = require("express-validator");
const blackListTokenModel = require("../models/blackListToken.model");
module.exports.registerCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password, vehicle } = req.body;

  const captainExists = await captainModel.findOne({ email });
  if (captainExists) {
    return res
      .status(401)
      .json({ message: "Email already in use.", success: false });
  }
  const hashedPassword = await captainModel.hashPassword(password);

  const captain = await captainService.createCaptain({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashedPassword,
    color: vehicle.color,
    capacity: vehicle.capacity,
    plate: vehicle.plate,
    vehicleType: vehicle.vehicleType,
  });
  const token = captain.generateAuthToken();
  res.status(200).json({ token, captain, success: true });
};

module.exports.loginCaptain = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  const { email, password } = req.body;
  const captain = await captainModel.findOne({ email }).select("+password");
  if (!captain) {
    return res
      .status(404)
      .json({ message: "Captain does not exists.", success: false });
  }
  const isMatch = await captain.comparePassword(password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ message: "Password incorrect.", success: false });
  }
  const token = captain.generateAuthToken();
  res.cookie("token", token);
  return res.status(200).json({ token, captain, success: true });
};

module.exports.getCaptainProfile = async (req, res, next) => {
  res.status(200).json({ captain: req.captain, success: true });
};

module.exports.logoutCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  await blackListTokenModel.create({ token });

  res.clearCookie("token");

  res.status(200).json({ message: "Logout successfully" });
};
