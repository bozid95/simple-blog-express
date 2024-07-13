require("dotenv").config();
const express = require("express");
const expressLayout = require("express-ejs-layouts");
const mongoose = require("mongoose");
const coockieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");

mongoose.connect("mongodb://127.0.0.1:27017/db_nodejsblog");

const app = express();
const PORT = 3000 || process.env.PORT;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(coockieParser());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

//templat engine
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));

app.listen(PORT, () => {
  console.log(` Berjalan di Port ${PORT}`);
});
