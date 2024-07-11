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
