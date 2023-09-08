const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User.js");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const port = 8080

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "346rkgmvcbzhgcitudfhxgs3e5779";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    // origin: 'http://127.0.0.1:5173',
    origin: "http://localhost:5173",
  })
);

// connect to database
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

// To reset the cookie when logout
app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

// app.listen(4000);
app.listen(port, () => console.log(`Server has started on port: ${port}`))
