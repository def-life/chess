/*
  Warnings:

  - A unique constraint covering the columns `[socialId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GameResult" AS ENUM ('DRAW_BY_THREEFOLD_REPETITION', 'DRAW_BY_FIFTY_MOVE_RULE', 'DRAW_BY_INSUFFICIENT_MATERIAL', 'STALEMATE', 'CHECKMATE', 'RESIGNATION', 'TIMEOUT');

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "pgn" TEXT NOT NULL,
    "wUserId" TEXT NOT NULL,
    "bUserId" TEXT NOT NULL,
    "winnerUserId" TEXT NOT NULL,
    "result" "GameResult" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_socialId_key" ON "User"("socialId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_wUserId_fkey" FOREIGN KEY ("wUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_bUserId_fkey" FOREIGN KEY ("bUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_winnerUserId_fkey" FOREIGN KEY ("winnerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
