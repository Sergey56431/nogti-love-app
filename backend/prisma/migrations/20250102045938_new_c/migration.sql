-- AlterTable
ALTER TABLE "Directs" ALTER COLUMN "comment" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshToken" TEXT;
