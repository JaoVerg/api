const User = require("../models/user");

module.exports = {
  async getUsersExceptLoggedIn(loggedInUserId) {
    return await User.find({ _id: { $ne: loggedInUserId } });
  },

  async getUserById(userId) {
    return await User.findById(userId);
  },

  async sendFriendRequest(currentUserId, selectedUserId) {
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { friendRequest: currentUserId },
    });

    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequest: selectedUserId },
    });
  },

  async getFriendRequests(userId) {
    const user = await User.findById(userId)
      .populate("friendRequest", "name email image")
      .lean();
    return user.friendRequest;
  },

  async acceptFriendRequest(senderId, recipientId) {
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (sender && recipient) {
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
    }
  },

  async getAcceptedFriends(userId) {
    const user = await User.findById(userId).populate(
      "friends",
      "name email image"
    );
    return user.friends;
  },

  async getUserDetails(userId) {
    return await User.findById(userId);
  },

  async cancelFriendRequest(currentUserId, selectedUserId) {
    const currentUser = await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { sentFriendRequest: selectedUserId } },
      { new: true }
    );

    const selectedUser = await User.findByIdAndUpdate(
      selectedUserId,
      { $pull: { friendRequest: currentUserId } },
      { new: true }
    );
  },

  async searchUsers(userId) {
    const currentUser = await User.findById(userId)
      .populate("friends")
      .populate("friendRequest")
      .populate("sentFriendRequest");

    const friendsIds = currentUser.friends.map((friend) => friend._id);
    const friendRequestIds = currentUser.friendRequest.map(
      (request) => request._id
    );
    const sentFriendRequestIds = currentUser.sentFriendRequest.map(
      (request) => request._id
    );

    return await User.find({
      _id: {
        $nin: [
          userId,
          ...friendsIds,
          ...friendRequestIds,
          ...sentFriendRequestIds,
        ],
      },
    });
  },

  async declineFriendRequest(userId, requestId) {
    const user = await User.findById(userId);
    if (user) {
      user.friendRequest = user.friendRequest.filter(
        (request) => request.toString() !== requestId
      );
      await user.save();
    }
  },

  async deleteFriend(userId, friendId) {
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
  },
};
