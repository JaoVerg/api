const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to local MongoDB
mongoose
  .connect("mongodb://localhost:27017/yourDatabaseName", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of waiting indefinitely
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  })
  .then(() => {
    console.log("Connected to local MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to local MongoDB", err);
  });

// Models
const User = require("./models/user");
const Message = require("./models/message");

// Endpoint for user registration
app.post("/register", async (req, res) => {
  const { name, email, password, image } = req.body;

  try {
    // Check if required fields are present
    if (!name || !email || !password || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create user object with hashed password
    const newUser = new User({
      name,
      email,
      password,
      image,
    });

    // Save user to the database
    await newUser.save();

    // Respond with success message
    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user", err);
    res.status(500).json({ message: "Error registering the user" });
  }
});

// Token creation
const createToken = (userId) => {
  const payload = {
    userId: userId,
  };
  const token = jwt.sign(payload, "Q$r2K6W8n!jCW%Zk", { expiresIn: "1h" });
  return token;
};

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password!" });
    }

    const token = createToken(user._id);
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in finding the user", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to get all users except the logged-in user
app.get("/users/:userId", async (req, res) => {
  const loggedInUserId = req.params.userId;

  try {
    const users = await User.find({ _id: { $ne: loggedInUserId } });
    res.status(200).json(users);
  } catch (err) {
    console.log("Error retrieving users", err);
    res.status(500).json({ message: "Error retrieving users" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//endpoint sent friend request

app.post("/friend-request", async (req, res) => {
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
});

//show all friends
app.get("/friend-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate("friendRequest", "name email image")
      .lean();

    const friendRequest = user.friendRequest;

    res.json(friendRequest);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to accept a friend request of a particular person
app.post("/friend-request/accept", async (req, res) => {
  try {
    const { senderId, recipientId } = req.body;

    // Retrieve the documents of sender and the recipient
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Add each other to the friends list
    sender.friends.push(recipientId);
    recipient.friends.push(senderId);

    // Ensure friendRequest is an array before filtering
    if (!Array.isArray(recipient.friendRequest)) {
      recipient.friendRequest = [];
    }

    // Remove the sender from the recipient's friend requests
    recipient.friendRequest = recipient.friendRequest.filter(
      (request) => request.toString() !== senderId.toString()
    );

    // Ensure sentFriendRequest is an array before filtering
    if (!Array.isArray(sender.sentFriendRequest)) {
      sender.sentFriendRequest = [];
    }

    // Remove the recipient from the sender's sent friend requests
    sender.sentFriendRequest = sender.sentFriendRequest.filter(
      (request) => request.toString() !== recipientId.toString()
    );

    // Save the updated documents
    await sender.save();
    await recipient.save();

    res.status(200).json({ message: "Friend Request accepted successfully" });
  } catch (error) {
    console.log("Error accepting friend request", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/*
// Endpoint to accept a friend request of a particular person
app.post("/friend-request/accept", async (req, res) => {
  try {
    const { senderId, recipientId } = req.body;

    // Retrieve the documents of sender and the recipient
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Add each other to the friends list
    sender.friends.push(recipientId);
    recipient.friends.push(senderId);

    // Remove the sender from the recipient's friend requests
    recipient.friendRequest = recipient.friendRequest.filter(
      (request) => request.toString() !== senderId.toString()
    );

    // Remove the recipient from the sender's sent friend requests
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (request) => request.toString() !== recipientId.toString()
    );

    // Save the updated documents
    await sender.save();
    await recipient.save();

    res.status(200).json({ message: "Friend Request accepted successfully" });
  } catch (error) {
    console.log("Error accepting friend request", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
*/

//endpoint to access all the friends of the logged in user!
app.get("/accepted-friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "friends",
      "name email image"
    );
    const acceptedFriends = user.friends;
    res.json(acceptedFriends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/messages", async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText, imageBase64 } =
      req.body;

    if (!senderId || !recepientId || !messageType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText || "",
      imageUrl: messageType === "image" ? imageBase64 : null,
    });

    await newMessage.save();
    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to get userdetails to appear in chat room

///endpoint to get the userDetails to design the chat Room header
app.get("/user/:userId", async (req, res) => {
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
});

//endpoint to fetch between two users
//endpoint to fetch the messages between two users in the chatRoom
// Endpoint to fetch messages between two users
app.get("/messages/:senderId/:recepientId", async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;

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
});

//endpoint to delete the messages!
// Endpoint to delete messages
app.delete("/messages", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    await Message.deleteMany({ _id: { $in: messages } });

    res.json({ message: "Messages deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
