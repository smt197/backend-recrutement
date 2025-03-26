/*
  Warnings:

  - You are about to alter the column `skills` on the `JobPost` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `JobPost` MODIFY `skills` JSON NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `experience` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `skills` JSON NULL;
