require("dotenv").config();
const path = require("node:path");
const express = require("express");
const app = express();
const errorHandler = require("./router/middlewares").errorHandler;
const router = require("./router/router");
const passport = require("./passport");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("./generated/prisma");

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    secret: "a santa at nasa",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.listen(3000, () => console.log("app listening on port 3000!"));
app.use("/", router);
app.use(errorHandler);
