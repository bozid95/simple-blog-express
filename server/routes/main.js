const express = require("express");
const Post = require("../models/Post");
const router = express.Router();

router.get("", async (req, res) => {
  try {
    const locals = {
      title: "Blog Node JS",
      description: "Blog ini dibangun menggunakan Node JS Express dan Mongo DB",
    };

    let perPage = 5;
    let page = req.query.page || 1;
    const dataPost = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const prevPage = parseInt(page) - 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);
    res.render("index", {
      locals,
      dataPost,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      prevPage,
    });
  } catch (error) {
    console.log(error);
  }
});

//POST DATA
router.get("/post/:id", async (req, res) => {
  try {
    const locals = {
      title: "Blog Node JS",
      description: "Blog ini dibangun menggunakan Node JS Express dan Mongo DB",
    };
    let slug = req.params.id;
    const dataPost = await Post.findById({ _id: slug });
    res.render("post", {
      locals,
      dataPost,
    });
  } catch (error) {
    console.log(error);
  }
});

// //route insert post Dummy
// function insertPostData() {
//   Post.insertMany([
//     {
//       title: "Aplikasi ERD",
//       body: "Quickly design and customize responsive mobile-first sites with Bootstrap, the world’s most popular front-end open source toolkit, featuring Sass variables and mixins, responsive grid system, extensive prebuilt components, and powerful JavaScript plugins. ",
//     },
//   ]);
// }
// insertPostData();

module.exports = router;
