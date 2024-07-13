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
  cancelFriendRequest,
  searchUsers,
  declineFriendRequest,
  deleteFriend,
} = require("../controllers/userController");

router.get("/chats/:userId", getUserById);
router.get("/:userId", getUsers);
router.post("/friend-request", sendFriendRequest);
router.get("/friend-request/:userId", getFriendRequests);
router.post("/friend-request/accept", acceptFriendRequest);
router.get("/accepted-friends/:userId", getAcceptedFriends);
router.get("/details/:userId", getUserDetails);
router.post("/cancel-friend-request", cancelFriendRequest);
router.get("/search/:userId", searchUsers);
router.delete(
  "/decline-friend-request/:userId/:requestId",
  declineFriendRequest
);
router.delete("/friends/:userId/:friendId", deleteFriend);
module.exports = router;
