/*
  Warnings:

  - The primary key for the `Files` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Files" DROP CONSTRAINT "Files_pkey",
ALTER COLUMN "fileId" DROP DEFAULT,
ALTER COLUMN "fileId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Files_pkey" PRIMARY KEY ("fileId");
DROP SEQUENCE "Files_fileId_seq";
