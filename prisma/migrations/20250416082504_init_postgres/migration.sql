-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'RECRUTEUR', 'CANDIDATE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'PRESELECTED', 'REJECTED', 'INTERVIEW_SCHEDULED', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'PRESELECTED', 'REJECTED', 'INTERVIEW', 'ACCEPTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CANDIDATE',
    "isTwoFA" BOOLEAN NOT NULL DEFAULT false,
    "twoFAVerified" BOOLEAN NOT NULL DEFAULT false,
    "twoFASecret" TEXT,
    "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,
    "experience" INTEGER NOT NULL DEFAULT 1,
    "skills" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPost" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "skills" JSONB,
    "location" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "recruiterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "candidateId" INTEGER NOT NULL,
    "jobId" INTEGER NOT NULL,
    "cvUrl" TEXT NOT NULL,
    "coverLetterUrl" TEXT,
    "portfolioUrl" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
