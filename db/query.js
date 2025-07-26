const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

async function addUser(username, password) {
  await prisma.users.create({
    data: {
      username: username,
      password: password,
    },
  });
}

async function getUser(username) {
  const user = await prisma.users.findUnique({
    where: {
      username: username,
    },
  });
  return user;
}

async function getUserById(id) {
  const user = await prisma.users.findUnique({
    where: {
      id: id,
    },
  });
  return user;
}

async function getCurrFolderSubfolders(folderid) {
  const subfolders = await prisma.folders.findMany({
    where: {
      parentFolderId: folderid,
    },
  });
  return subfolders;
}

async function getCurrFolderFiles(folderId) {
  const files = await prisma.files.findMany({
    where: {
      folderId: folderId,
    },
  });
  return files;
}

async function addFolder(parentFolderId, userid, folderName) {
  await prisma.folders.create({
    data: {
      userid: userid,
      parentFolderId: parentFolderId,
      folderName: folderName,
    },
  });
}

async function createHomeDirectory(userid) {
  await prisma.folders.create({
    data: {
      userid: userid,
      folderName: "Home",
      parentFolderId: null,
    },
  });
}

async function getHomeDirectoryId(userid) {
  const row = await prisma.folders.findMany({
    where: {
      AND: [
        {
          userid: userid,
        },
        {
          parentFolderId: null,
        },
      ],
    },
    select: {
      id: true,
    },
  });
  return row[0].id;
}

async function addFile(folderId, filePath, fileName, size) {
  await prisma.files.create({
    data: {
      folderId: folderId,
      filePath: filePath,
      fileName: fileName,
      size: size,
    },
  });
}

async function getParentId(folderId) {
  const row = await prisma.folders.findUnique({
    where: {
      id: folderId,
    },
  });
  return row.parentFolderId;
}

async function getFolderName(folderId) {
  const row = await prisma.folders.findUnique({
    where: {
      id: folderId,
    },
  });
  return row.folderName;
}

async function getParentNames(folderId) {
  const parents = [];
  parents.push(parseInt(folderId));
  let currParentId = await getParentId(parseInt(folderId));
  while (currParentId != null) {
    //  -1 indicates the root node
    parents.push(currParentId);
    currParentId = await getParentId(parseInt(currParentId));
  }
  const parentNames = await Promise.all(
    parents.map((parent) => {
      return getFolderName(parent);
    })
  );
  return parentNames.reverse();
}

async function deleteFolder(userid, folderId) {
  const row = await prisma.folders.findUnique({
    where: {
      id: folderId,
    },
  });
  if (row.userid != userid) {
    throw new Error("Sorry you can't access this !");
  } else {
    await prisma.folders.delete({
      where: {
        id: folderId,
      },
    });
  }
}

async function renameFolder(userid, folderId, newName) {
  const row = await prisma.folders.findUnique({
    where: {
      id: folderId,
    },
  });
  if (row.userid != userid) {
    throw new Error("Sorry you can't access this !");
  } else {
    await prisma.folders.update({
      where: {
        id: folderId,
      },
      data: {
        folderName: newName,
      },
    });
  }
}

async function getFileInfo(fileId) {
  const row = await prisma.files.findUnique({
    where: {
      fileId: fileId,
    },
    include: {
      folder: true,
    },
  });
  return row;
}

async function removeFile(fileId) {
  await prisma.files.delete({
    where: {
      fileId: fileId,
    },
  });
}

async function checkUser(username) {
  const row = await prisma.users.findMany({
    where: {
      username: username,
    },
  });
  return row.length > 0;
}

async function getFolderInfo(folderId) {
  const row = await prisma.folders.findUnique({
    where: {
      id: folderId,
    },
  });
  return row;
}

module.exports = {
  addUser,
  getUser,
  getUserById,
  getHomeDirectoryId,
  getCurrFolderFiles,
  getCurrFolderSubfolders,
  createHomeDirectory,
  addFile,
  addFolder,
  getParentId,
  getFolderName,
  getParentNames,
  deleteFolder,
  renameFolder,
  getFileInfo,
  removeFile,
  checkUser,
  getFolderInfo,
};
