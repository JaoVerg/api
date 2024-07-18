const Message = require("../models/message");
const User = require("../models/user");

exports.sendMessage = async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);

  const { senderId, messageType, messageText, imageUri } = req.body;
  const { recepientId } = req.params;

  try {
    if (!senderId || !recepientId || !messageType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText || "",
      imageUrl: messageType === "image" ? imageUri : null,
    });

    await newMessage.save();
    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getMessages = async (req, res) => {
  const { senderId, recepientId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    }).populate("senderId", "_id name");

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
/*
exports.deleteMessages = async (req, res) => {
  const { messages } = req.body;
  console.log("Messages to delete:", messages); // Log incoming request data

  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const result = await Message.deleteMany({ _id: { $in: messages } });
    console.log("Delete result:", result); // Log result of the delete operation

    res.json({ message: "Messages deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
*/

exports.deleteMessages = async (req, res) => {
  const { messageId } = req.params;
  console.log("Message ID to delete:", messageId); // Log incoming request data

  try {
    if (!messageId) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const result = await Message.deleteOne({ _id: messageId });
    console.log("Delete result:", result); // Log result of the delete operation

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/*
exports.deleteMessages = async (req, res) => {
  const { messages } = req.body;
  console.log("Messages to delete:", messages); // Log incoming request data

  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const result = await Message.deleteMany({ _id: { $in: messages } });
    console.log("Delete result:", result); // Log result of the delete operation

    res.json({ message: "Messages deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

*/

exports.markMessageSeen = async (req, res) => {
  const { messageId } = req.params;
  const { userId } = req.body;

  try {
    const message = await Message.findOneAndUpdate(
      { _id: messageId, recepientId: userId },
      { seen: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    console.log("Message marked as seen:", message); // Log the updated message
    res.json(message);
  } catch (error) {
    console.error("Error marking message as seen:", error);
    res.status(500).json({ message: "Server error" });
  }
};
