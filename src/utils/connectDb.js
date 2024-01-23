const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.DB_URL
    );
    console.log(
      `☘️  MongoDB Connected!`
    );
  } catch (error) {
    console.log("MongoDB connection error: ", error);
    setTimeout(connectDB, 5000);
  }
};

module.exports=connectDB;