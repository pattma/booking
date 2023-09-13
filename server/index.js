const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User.js");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const httpServer = require("http").createServer(app); // Create an HTTP server
const io = require("socket.io")(httpServer); // Initialize Socket.io

const bcryptSalt = bcrypt.genSaltSync(10);
const { SERVER_PORT, SECRET_KEY } = process.env;
const port = SERVER_PORT;
const jwtSecret = SECRET_KEY;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

// Connect to database
mongoose.connect(process.env.MONGO_URL);

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e); // status code 422 = Unprocessable Entity
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign(
        { email: userDoc.email, id: userDoc._id, name: userDoc.name },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(userDoc);
        }
      );
    } else {
      res.status(422).json("password is not ok");
    }
  } else {
    res.json("not found");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, _id } = await User.findById(userData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});

// Add a route to emit a WebSocket event when a user's profile data changes
app.post("/profile", async (req, res) => {
  const { name, email, _id } = req.body; // Update user data
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { name, email },
    { new: true }
  );

  // Emit a WebSocket event with the updated user data
  io.emit("Header", updatedUser);

  res.json(updatedUser);
});

// Add this line to debug WebSocket events in index.js
io.on("connection", (socket) => {
  console.log("WebSocket connection established");

  socket.on("Header", (data) => {
    console.log("Received WebSocket event in index.js:", data);
  });
});

// To reset the cookie when logout
app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

app.listen(port, () => console.log(`Server has started on port: ${port}`));