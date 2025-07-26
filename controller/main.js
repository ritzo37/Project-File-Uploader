const db = require("../db/query");
const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function getSignUpPage(req, res) {
  res.render("signup", { errors: [] });
}

function getLoginPage(req, res) {
  res.render("login");
}

async function handleSignin(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("signup.ejs", {
      errors: errors.array(),
    });
  }
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  await db.addUser(username, hash);
  const user = await db.getUser(username);
  const userId = user.id;
  await db.createHomeDirectory(userId);
  res.redirect("./log-in");
}

async function handleLoggedin(req, res) {
  if (req.isAuthenticated()) {
    res.render("loggedin");
  } else {
    res.redirect("./log-in");
  }
}

async function getHomePage(req, res) {
  if (req.isAuthenticated()) {
    const userId = req.session.passport.user;
    const folderId = await db.getHomeDirectoryId(userId);
    res.render("home.ejs", { userId: userId, folderId: folderId });
  } else {
    res.render("homenonloggedin.ejs");
  }
}

async function getHome(req, res) {
  let { userId } = req.params;
  userId = parseInt(userId);
  const localUserId = parseInt(userId);
  const loggedInUserId = req.session.passport.user;
  if (localUserId !== loggedInUserId) {
    res.send("<h1>You cannot access this page! </h1>");
  } else {
    const homeDirecId = await db.getHomeDirectoryId(userId);
    const homeDirectSubfolders = await db.getCurrFolderSubfolders(homeDirecId);
    const homeDirecFiles = await db.getCurrFolderFiles(homeDirecId);
    res.render("page.ejs", {
      folders: homeDirectSubfolders,
      files: homeDirecFiles,
      userid: userId,
      path: "/Home",
      folderId: homeDirecId,
    });
  }
}

async function getPage(req, res) {
  let { userId, folderId } = req.params;
  const localUserId = parseInt(userId);
  const loggedInUserId = req.session.passport.user;
  if (localUserId != loggedInUserId) {
    res.send("<h1>You cannot access this page </h1>");
  } else {
    const parentNames = await db.getParentNames(folderId);
    let path = "/";
    parentNames.forEach((name) => {
      path = path + name + "/";
    });
    folderId = parseInt(folderId);
    const subFolders = await db.getCurrFolderSubfolders(folderId);
    const files = await db.getCurrFolderFiles(folderId);
    res.render("page.ejs", {
      folders: subFolders,
      files: files,
      userid: userId,
      path: path,
      folderId: folderId,
    });
  }
}

async function getAddFolderPage(req, res) {
  let { userId, folderId } = req.params;
  res.render("addFolder.ejs", { userId: userId, folderId: folderId });
}

async function handleAddFolderPage(req, res) {
  let { userId, folderId } = req.params;
  let { folderName } = req.body;
  userId = parseInt(userId);
  folderId = parseInt(folderId);
  await db.addFolder(folderId, userId, folderName);
  const redirectPath = "/" + userId + "/" + folderId;
  res.redirect(redirectPath);
}

async function getUpdateFolderPage(req, res) {
  let { userId, folderId } = req.params;
  res.render("updateFolder.ejs", { userId: userId, folderId: folderId });
}

async function handleUpdateFolder(req, res) {
  let { userId, folderId } = req.params;
  const { folderName } = req.body;
  userId = parseInt(userId);
  folderId = parseInt(folderId);
  const parentFolderId = await db.getParentId(folderId);
  await db.renameFolder(userId, folderId, folderName);
  const redirectPath = "/" + userId + "/" + parentFolderId;
  res.redirect(redirectPath);
}

async function handleDeleteFolder(req, res) {
  let { userId, folderId } = req.params;
  userId = parseInt(userId);
  folderId = parseInt(folderId);
  const parentFolderId = await db.getParentId(folderId);
  await db.deleteFolder(userId, folderId);
  const redirectPath = "/" + userId + "/" + parentFolderId;
  res.redirect(redirectPath);
}

async function handleFileUpload(req, res) {
  const file = req.file;
  const size = parseInt(req.file.size);
  const sizeInKb = Math.ceil(size / 1000);
  const sizeInMb = Math.ceil(sizeInKb / 1000);
  const randomId = uuidv4() + file.originalname;
  const { data, error } = await supabase.storage
    .from("test")
    .upload(randomId, file.buffer);
  if (error) {
    throw error;
  }
  let currPath = data.path;
  let { userId, folderId } = req.params;
  userId = parseInt(userId);
  folderId = parseInt(folderId);
  await db.addFile(folderId, currPath, file.originalname, sizeInMb);
  const redirectPath = "/" + userId + "/" + folderId;
  res.redirect(redirectPath);
}

async function getFile(req, res) {
  let { userId, folderId, fileId } = req.params;
  userId = parseInt(userId);
  folderId = parseInt(folderId);
  fileId = parseInt(fileId);
  const fileInfo = await db.getFileInfo(fileId);
  if (fileInfo.folder.id != folderId || fileInfo.folder.userid != userId) {
    res.send("<h1>You cannot acess this resource</h1>");
  } else {
    const filePath = fileInfo.filePath;
    const { data } = supabase.storage.from("test").getPublicUrl(filePath, {
      download: true,
    });
    const URL = data.publicUrl;
    res.redirect(URL);
  }
}

async function handleDeleteFile(req, res) {
  let { userId, folderId, fileId } = req.params;
  userId = parseInt(userId);
  folderId = parseInt(folderId);
  fileId = parseInt(fileId);
  const fileInfo = await db.getFileInfo(fileId);
  if (fileInfo.folder.id != folderId || fileInfo.folder.userid != userId) {
    res.send("<h1>You cannot acess this resource</h1>");
  } else {
    const filePath = fileInfo.filePath;
    const { data, error } = await supabase.storage
      .from("test")
      .remove([filePath]);
    if (error) {
      res.send("<h1>Something bad happened please try again !</h1>");
    } else {
      await db.removeFile(fileId);
      const pathToRedirect = "/" + userId + "/" + folderId + "/";
      res.redirect(pathToRedirect);
    }
  }
}

async function getFileDetails(req, res) {
  let { userId, folderId, fileId } = req.params;
  userId = parseInt(userId);
  folderId = parseInt(folderId);
  fileId = parseInt(fileId);
  const fileInfo = await db.getFileInfo(fileId);
  if (fileInfo.folder.id != folderId || fileInfo.folder.userid != userId) {
    res.send("<h1>You cannot acess this resource</h1>");
  } else {
    const fileName = fileInfo.fileName;
    const size = fileInfo.size;
    const time = fileInfo.createdAt;
    res.render("fileInfo.ejs", {
      userId: userId,
      folderId: folderId,
      fileId: fileId,
      fileName: fileName,
      size: size,
      time: time,
    });
  }
}

async function logout(req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

module.exports = {
  getSignUpPage,
  getLoginPage,
  handleSignin,
  handleLoggedin,
  getHomePage,
  getHome,
  getPage,
  getAddFolderPage,
  handleAddFolderPage,
  handleUpdateFolder,
  handleDeleteFolder,
  getUpdateFolderPage,
  handleFileUpload,
  getFile,
  handleDeleteFile,
  getFileDetails,
  logout,
};
