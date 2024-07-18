const User = require("../models/user");
const userService = require("../services/userService");
// Get all users except the logged-in user
exports.getUsers = async (req, res) => {
  const loggedInUserId = req.params.userId;

  try {
    const users = await userService.getUsersExceptLoggedIn(loggedInUserId);
    res.status(200).json(users);
  } catch (err) {
    console.error("Error retrieving users", err);
    res.status(500).json({ message: "Error retrieving users" });
  }
};

// Get a user by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Send a friend request
exports.sendFriendRequest = async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    await userService.sendFriendRequest(currentUserId, selectedUserId);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
};

// Get friend requests for a user
exports.getFriendRequests = async (req, res) => {
  const { userId } = req.params;

  try {
    const friendRequests = await userService.getFriendRequests(userId);
    res.json(friendRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Accept a friend request
exports.acceptFriendRequest = async (req, res) => {
  const { senderId, recipientId } = req.body;

  try {
    await userService.acceptFriendRequest(senderId, recipientId);
    res.status(200).json({ message: "Friend Request accepted successfully" });
  } catch (error) {
    console.error("Error accepting friend request", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get accepted friends for a user
exports.getAcceptedFriends = async (req, res) => {
  const { userId } = req.params;

  try {
    const acceptedFriends = await userService.getAcceptedFriends(userId);
    res.json(acceptedFriends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get user details by ID
exports.getUserDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const userDetails = await userService.getUserDetails(userId);
    res.json(userDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Cancel a friend request
exports.cancelFriendRequest = async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    await userService.cancelFriendRequest(currentUserId, selectedUserId);
    res.status(200).json({ message: "Friend request canceled" });
  } catch (error) {
    console.error("Error canceling friend request:", error);
    res.status(500).json({ error: "Failed to cancel friend request" });
  }
};

// Search users who are not friends or in friend requests
exports.searchUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const users = await userService.searchUsers(userId);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Decline a friend request
exports.declineFriendRequest = async (req, res) => {
  try {
    const { userId, requestId } = req.params;
    await userService.declineFriendRequest(userId, requestId);
    res.status(200).send("Friend request declined");
  } catch (error) {
    res.status(500).send("Server error");
  }
};

// Delete a friend
exports.deleteFriend = async (req, res) => {
  const { userId, friendId } = req.params;

  try {
    await userService.deleteFriend(userId, friendId);
    res.status(200).json({ message: "Friend deleted successfully" });
  } catch (error) {
    console.error("Error deleting friend:", error);
    res.status(500).json({ error: "Server error" });
  }
};
