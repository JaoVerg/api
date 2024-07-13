const User = require("../models/user");

exports.getUsers = async (req, res) => {
  const loggedInUserId = req.params.userId;

  try {
    const users = await User.find({ _id: { $ne: loggedInUserId } });
    res.status(200).json(users);
  } catch (err) {
    console.log("Error retrieving users", err);
    res.status(500).json({ message: "Error retrieving users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.sendFriendRequest = async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { friendRequest: currentUserId },
    });

    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequest: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
};

exports.getFriendRequests = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId)
      .populate("friendRequest", "name email image")
      .lean();
    res.json(user.friendRequest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  const { senderId, recipientId } = req.body;

  try {
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (!sender) return res.status(404).json({ message: "Sender not found" });
    if (!recipient)
      return res.status(404).json({ message: "Recipient not found" });

    sender.friends.push(recipientId);
    recipient.friends.push(senderId);

    recipient.friendRequest = recipient.friendRequest.filter(
      (req) => req.toString() !== senderId.toString()
    );
    sender.sentFriendRequest = sender.sentFriendRequest.filter(
      (req) => req.toString() !== recipientId.toString()
    );

    await sender.save();
    await recipient.save();

    res.status(200).json({ message: "Friend Request accepted successfully" });
  } catch (error) {
    console.log("Error accepting friend request", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAcceptedFriends = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate(
      "friends",
      "name email image"
    );
    res.json(user.friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUserDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.cancelFriendRequest = async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    // Find the current user and update sentFriendRequest
    const currentUser = await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { sentFriendRequest: selectedUserId } },
      { new: true }
    );

    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    // Find the selected user and update friendRequest
    const selectedUser = await User.findByIdAndUpdate(
      selectedUserId,
      { $pull: { friendRequest: currentUserId } },
      { new: true }
    );

    if (!selectedUser) {
      return res.status(404).json({ error: "Selected user not found" });
    }

    // Respond with success message
    res.status(200).json({ message: "Friend request canceled" });
  } catch (error) {
    console.error("Error canceling friend request:", error);
    res.status(500).json({ error: "Failed to cancel friend request" });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the current user
    const currentUser = await User.findById(userId)
      .populate("friends")
      .populate("friendRequest")
      .populate("sentFriendRequest");

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get IDs of friends, friend requests, and sent friend requests
    const friendsIds = currentUser.friends.map((friend) => friend._id);
    const friendRequestIds = currentUser.friendRequest.map(
      (request) => request._id
    );
    const sentFriendRequestIds = currentUser.sentFriendRequest.map(
      (request) => request._id
    );

    // Find users who are not friends, and not in friend requests or sent friend requests
    const users = await User.find({
      _id: {
        $nin: [
          userId,
          ...friendsIds,
          ...friendRequestIds,
          ...sentFriendRequestIds,
        ],
      },
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.declineFriendRequest = async (req, res) => {
  try {
    const { userId, requestId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).send("User not found");

    user.friendRequest = user.friendRequest.filter(
      (request) => request.toString() !== requestId
    );
    await user.save();

    res.status(200).send("Friend request declined");
  } catch (error) {
    res.status(500).send("Server error");
  }
};

exports.deleteFriend = async (req, res) => {
  const { userId, friendId } = req.params;

  try {
    // Remove friendId from user's friends array
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });

    // Also remove userId from friend's friends array
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    res.status(200).json({ message: "Friend deleted successfully" });
  } catch (error) {
    console.error("Error deleting friend:", error);
    res.status(500).json({ error: "Server error" });
  }
};
