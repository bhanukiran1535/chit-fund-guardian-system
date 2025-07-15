const mongoose = require("mongoose");
const MongoDB_Connection_String = "mongodb+srv://bhanukiran1535:mschitswebsitedbpass@websitecluster.zrsvzq7.mongodb.net/MSWebsiteDB?retryWrites=true&w=majority&appName=WebsiteCluster";

const ConnectDB = async () => {
  try {
    await mongoose.connect(MongoDB_Connection_String);
    console.log("MongoDB Connected Successfully to WebsiteCluster 👏🏻");
  } catch (error) {
    console.log("MongoDB connection failed ❌", error.message);
  }
};

module.exports = ConnectDB;