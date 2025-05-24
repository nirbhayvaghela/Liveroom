/*
  Warnings:

  - You are about to drop the `_RoomUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RoomUsers" DROP CONSTRAINT "_RoomUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomUsers" DROP CONSTRAINT "_RoomUsers_B_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roomId" TEXT;

-- DropTable
DROP TABLE "_RoomUsers";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("room_id") ON DELETE CASCADE ON UPDATE CASCADE;
