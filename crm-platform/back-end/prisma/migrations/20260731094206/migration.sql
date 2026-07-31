/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `VerificationToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `VerificationToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `VerificationToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `VerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerificationTokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "VerificationToken" DROP COLUMN "tokenHash",
ADD COLUMN     "token" TEXT NOT NULL,
ADD COLUMN     "type" "VerificationTokenType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE INDEX "VerificationToken_userId_idx" ON "VerificationToken"("userId");
