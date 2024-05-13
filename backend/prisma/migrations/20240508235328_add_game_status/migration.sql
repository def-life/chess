/*
  Warnings:

  - Added the required column `status` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'TIME_UP');

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_winnerUserId_fkey";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "status" "GameStatus" NOT NULL,
ALTER COLUMN "winnerUserId" DROP NOT NULL,
ALTER COLUMN "result" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_winnerUserId_fkey" FOREIGN KEY ("winnerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
