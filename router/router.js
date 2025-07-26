const express = require("express");
const router = express.Router();
const controller = require("../controller/main.js");
const passport = require("../passport.js");
const multer = require("multer");
const util = require("../router/middlewares");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const validateUserNameAndPassword = require("../errorValidation.js");

router.get("/", controller.getHomePage);
router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "./loggedin",
  })
);

router.get("/sign-up", controller.getSignUpPage);
router.get("/log-in", controller.getLoginPage);
router.post("/sign-up", validateUserNameAndPassword, controller.handleSignin);
router.get("/loggedin", controller.handleLoggedin);
router.get("/:userId/:folderId", controller.getPage);
router.get("/:userId/:folderId/addFolder", controller.getAddFolderPage);
router.post(
  "/:userId/:folderId/addFolder",
  util.isAuth,
  util.checkFolderAccess,
  controller.handleAddFolderPage
);
router.get("/:userId/:folderId/updateFolder", controller.getUpdateFolderPage);
router.post(
  "/:userId/:folderId/updateFolder",
  util.isAuth,
  util.checkFolderAccess,
  controller.handleUpdateFolder
);
router.get(
  "/:userId/:folderId/deleteFolder",
  util.isAuth,
  util.checkFolderAccess,
  controller.handleDeleteFolder
);
router.get(
  "/:userId/:folderId/:fileId/deleteFile",
  util.isAuth,
  util.checkFileAccess,
  controller.handleDeleteFile
);
router.post(
  "/:userId/:folderId/addFile",
  upload.single("file"),
  util.isAuth,
  util.checkFolderAccess,
  controller.handleFileUpload
);
router.get("/:userId/:folderId/:fileId", controller.getFile);
router.post("/log-out", controller.logout);
router.get(
  "/:userId/:folderId/:fileId/fileDetails",
  util.isAuth,
  util.checkFileAccess,
  controller.getFileDetails
);
module.exports = router;
