/*
  Warnings:

  - The primary key for the `Files` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fileURL` on the `Files` table. All the data in the column will be lost.
  - The `fileId` column on the `Files` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `filePath` to the `Files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Files" DROP CONSTRAINT "Files_pkey",
DROP COLUMN "fileURL",
ADD COLUMN     "filePath" TEXT NOT NULL,
DROP COLUMN "fileId",
ADD COLUMN     "fileId" SERIAL NOT NULL,
ADD CONSTRAINT "Files_pkey" PRIMARY KEY ("fileId");
