const User = require("../models/user");
const { createToken } = require("../utils/token");

exports.register = async (req, res) => {
  const { name, email, password, image } = req.body;

  try {
    if (!name || !email || !password || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newUser = new User({ name, email, password, image });
    await newUser.save();

    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user", err);
    res.status(500).json({ message: "Error registering the user" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

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
};
