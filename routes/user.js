const express = require("express");
const router = express.Router();
const {
  getUsers,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  getAcceptedFriends,
  getUserDetails,
  getUserById,
} = require("../controllers/userController");

router.get("/chats/:userId", getUserById);
router.get("/:userId", getUsers);
router.post("/friend-request", sendFriendRequest);
router.get("/friend-request/:userId", getFriendRequests);
router.post("/friend-request/accept", acceptFriendRequest);
router.get("/accepted-friends/:userId", getAcceptedFriends);
router.get("/details/:userId", getUserDetails);

module.exports = router;
