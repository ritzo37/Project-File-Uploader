const db = require("../db/query");

function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return next(new Error("Please login first !"));
  }
}

async function checkFolderAccess(req, res, next) {
  let { userId, folderId } = req.params;
  userId = parseInt(userId);
  folderId = parseInt(folderId);
  const loggedInUserId = req.session.passport.user;
  if (userId === loggedInUserId) {
    const folderInfo = await db.getFolderInfo(folderId);
    if (folderInfo.userid !== loggedInUserId) {
      return next(new Error("You don't have the acesss to this folder!"));
    } else {
      return next();
    }
  } else {
    return next(new Error("You don't have the access to this resource!"));
  }
}

async function checkFileAccess(req, res, next) {
  let { userId, folderId, fileId } = req.params;
  userId = parseInt(userId);
  folderId = parseInt(folderId);
  fileId = parseInt(fileId);
  const loggedInUserId = req.session.passport.user;
  const fileInfo = await db.getFileInfo(fileId);
  1;
  if (fileInfo.folder.userid !== loggedInUserId) {
    return next(new Error("You don't have the access to this resource!"));
  } else {
    return next();
  }
}

function errorHandler(err, req, res, next) {
  const errorMessage = err.message;
  res.render("showError.ejs", { errorMessage: errorMessage });
}

module.exports = {
  isAuth,
  checkFileAccess,
  checkFolderAccess,
  errorHandler,
};
