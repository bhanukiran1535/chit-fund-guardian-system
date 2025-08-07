const mongoose = require("mongoose");
const MongoDB_Connection_String = process.env.MONGODB_URI; // Set this in your .env file

const ConnectDB = async () => {
  try {
    await mongoose.connect(MongoDB_Connection_String);
    console.log("MongoDB Connected Successfully to WebsiteCluster 👏🏻");
  } catch (error) {
    console.log("MongoDB connection failed ❌", error.message);
  }
};

module.exports = ConnectDB;