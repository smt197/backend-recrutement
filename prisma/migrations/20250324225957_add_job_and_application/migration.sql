/*
  Warnings:

  - The primary key for the `Application` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `jobOfferId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `resumeUrl` on the `Application` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Application` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The values [INTERVIEW] on the enum `Application_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `JobOffer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cvUrl` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Application` DROP FOREIGN KEY `Application_jobOfferId_fkey`;

-- DropForeignKey
ALTER TABLE `JobOffer` DROP FOREIGN KEY `JobOffer_recruiterId_fkey`;

-- DropIndex
DROP INDEX `Application_jobOfferId_fkey` ON `Application`;

-- AlterTable
ALTER TABLE `Application` DROP PRIMARY KEY,
    DROP COLUMN `jobOfferId`,
    DROP COLUMN `resumeUrl`,
    ADD COLUMN `consentGiven` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `cvUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `jobId` INTEGER NOT NULL,
    ADD COLUMN `portfolioUrl` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `status` ENUM('PENDING', 'PRESELECTED', 'REJECTED', 'INTERVIEW_SCHEDULED', 'ACCEPTED') NOT NULL DEFAULT 'PENDING',
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `JobOffer`;

-- CreateTable
CREATE TABLE `JobPost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `experience` INTEGER NOT NULL,
    `skills` VARCHAR(191) NOT NULL,
    `deadline` DATETIME(3) NOT NULL,
    `recruiterId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JobPost` ADD CONSTRAINT `JobPost_recruiterId_fkey` FOREIGN KEY (`recruiterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `JobPost`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
