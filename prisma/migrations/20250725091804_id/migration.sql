/*
  Warnings:

  - You are about to drop the column `username` on the `Folders` table. All the data in the column will be lost.
  - Added the required column `userid` to the `Folders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Folders" DROP COLUMN "username",
ADD COLUMN     "userid" INTEGER NOT NULL;
