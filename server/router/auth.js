const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("../db/connection");
const User = require("../model/userSchema");

router.get("/", (req, res) => {
  res.send(`Server rotuer js`);
});

// Registration Route

router.post("/register", async (req, res) => {
  const { name, email, phone, work, password, cpassword } = req.body;

  if (!name || !email || !phone || !work || !password || !cpassword) {
    return res.status(422).json({ error: "Please filled the field properly" });
  }

  try {
    const userExist = await User.findOne({ email: email });

    if (userExist) {
      return res.status(422).json({ error: "Email already Exist" });
    } else if (password != cpassword) {
      return res.status(422).json({ error: "Password doesnt match" });
    } else {
      const user = new User({ name, email, phone, work, password, cpassword });

      await user.save();
      res.status(201).json({ messsage: "User resgistered successfully" });
    }
  } catch (err) {
    console.log(err);
  }
});

// Login Route

router.post("/signin", async (req, res) => {
  try {
    let jwtToken;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter email and passowrd" });
    }
    // res.json({ messsage: "Awesome" });

    const userLogin = await User.findOne({ email: email });

    if (userLogin) {
      const isEqual = await bcrypt.compare(password, userLogin.password);

      jwtToken = await userLogin.generateAuthToken();
      console.log(jwtToken);

      // cookies for 20 days
      res.cookie("jwtToken", jwtToken, {
        expires: new Date(Date.now() + 1728000000),
        httpOnly: true,
      });

      if (!isEqual) {
        res.status(400).json({ error: "Invalid email or password" });
      } else {
        res.json({ message: "Signin Successfull" });
      }
    } else {
      res.json({ error: "Invalid email or password" });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/searchDashboard", async (req, res) => {
  try {
    const { name, sorting, pageNo, pageLimit } = req.body;

    if (!sorting || !pageNo || !pageLimit) {
      return res.status(400).json({
        error: "Please enter all the required required search params",
      });
    }
    const pageOffset = pageNo * pageLimit;
    const queryName = req.body.name;
    let userList = [];
    if (name !== "") {
      userList = await User.find({ name: name }).limit(pageLimit);
    } else {
      userList = await User.find().limit(pageLimit);
    }

    res.json(userList);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
