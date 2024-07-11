const mongoose = require("mongoose");

const uri =
  "mongodb+srv://tracesystem1234:jstpwd123@cluster0.vh5o8db.mongodb.net/yourDatabaseName";
//mongodb+srv://tracesystem1234:<password>@cluster0.vh5o8db.mongodb.net/
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas", err);
  });

module.exports = mongoose;
