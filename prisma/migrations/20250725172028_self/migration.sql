-- AlterTable
ALTER TABLE "Folders" ALTER COLUMN "parentFolderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Folders" ADD CONSTRAINT "Folders_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "Folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
