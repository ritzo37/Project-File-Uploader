const { body } = require("express-validator");
const db = require("./db/query");

const validateUserNameAndPassword = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Please don't leave the username empty")
    .custom(async (value) => {
      const check = await db.checkUser(value);
      if (check) {
        throw new Error("Username already exists!");
      }
    }),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Please don't leave the password empty")
    .isLength({ min: 5, max: 20 })
    .withMessage("Please enter password of length between 5 and 20"),
  ,
];

module.exports = validateUserNameAndPassword;
