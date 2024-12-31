-- CreateEnum
CREATE TYPE "TypeOperation" AS ENUM ('income', 'expense');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'ADMIN', 'EMPLOYE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100),
    "username" VARCHAR(100) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "score" INTEGER,
    "password" VARCHAR(60) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENT',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calendar" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Directs" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "calendarId" INTEGER NOT NULL,

    CONSTRAINT "Directs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Income_Expanses" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "type" "TypeOperation" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createDate" DATE NOT NULL,

    CONSTRAINT "Income_Expanses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- AddForeignKey
ALTER TABLE "Directs" ADD CONSTRAINT "Directs_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
