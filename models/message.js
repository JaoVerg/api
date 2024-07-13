const mongoose = require("mongoose");

// Define the schema for messages
const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recepientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messageType: { type: String, required: true },
  message: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  imageUrl: { type: String },
  seen: { type: Boolean, default: false }, // Add seen field
});

// Create the Message model from the schema
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
