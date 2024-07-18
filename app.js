const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/message", messageRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
