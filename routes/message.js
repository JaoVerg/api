const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
  deleteMessages,
  markMessageSeen,
} = require("../controllers/messageController");

router.post("/:recepientId", sendMessage);
router.get("/:senderId/:recepientId", getMessages);
router.delete("/", deleteMessages);
router.put("/:messageId/seen", markMessageSeen);
module.exports = router;
