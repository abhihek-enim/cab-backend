const mongoose = require("mongoose");

function connectDB() {
  mongoose
    .connect(process.env.DB_URI)
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      console.log(err.message);
    });
}

module.exports = connectDB;
