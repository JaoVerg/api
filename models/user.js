const mongoose = require("mongoose");

// Define the schema for users
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email addresses are unique
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  friendRequest: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    },
  ],
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    },
  ],
  sentFriendRequest: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    },
  ],
});

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
