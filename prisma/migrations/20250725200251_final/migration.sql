/*
  Warnings:

  - Added the required column `fileName` to the `Files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileURL` to the `Files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Files" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fileName" TEXT NOT NULL,
ADD COLUMN     "fileURL" TEXT NOT NULL;
