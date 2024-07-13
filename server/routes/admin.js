const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Blog ini dibangun menggunakan Node JS Express dan Mongo DB",
    };
    res.render("admin/index", { locals });
  } catch (error) {
    console.log(error);
  }
});

// Check login
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credential" });
    }

    // The jwtSecret should be defined elsewhere in your configuration and imported here
    const jwtSecret = process.env.JWT_SECRET; // or require from a config file
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.status(500).send("Terjadi kesalahan server");
  }
});

//dashboard
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Blog ini dibangun menggunakan Node JS Express dan Mongo DB",
    };
    const dataPost = await Post.find();
    res.render("admin/dashboard", { dataPost, layout: adminLayout, locals });
  } catch (error) {
    console.log(error);
  }
});

//add POST
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Blog ini dibangun menggunakan Node JS Express dan Mongo DB",
    };
    res.render("admin/add-post", { layout: adminLayout, locals });
  } catch (error) {
    console.log(error);
  }
});

//Create POST
router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      body: req.body.body,
    });
    await Post.create(newPost);
    res.redirect("/dashboard");
    res.render("admin/add-post", { layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

//edit form
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit Post",
      description: "Blog ini dibangun menggunakan Node JS Express dan Mongo DB",
    };
    const dataPost = await Post.findOne({ _id: req.params.id });
    res.render("admin/edit-post", { dataPost, layout: adminLayout, locals });
  } catch (error) {
    console.log(error);
  }
});

//edit form
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });
    res.redirect(`/edit-post/${req.params.id}`);
    res.render("admin/add-post", { layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

//delete
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

//logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});
// router.post("/admin", async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     console.log(req.body);
//     if (req.body.username === "admin" && req.body.password === "admin") {
//       res.send("Login Berhasil");
//     } else {
//       res.send("Login Gagal");
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Terjadi kesalahan server");
//   }
// });

//untuk register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "user created", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "user already in use" });
      }
      res.status(500).json({ message: "internal Server Eror" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Terjadi kesalahan server");
  }
});

module.exports = router;
