/*
  Warnings:

  - You are about to drop the `OtherServiceMaster` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `bookingId` on the `OtherService` table. All the data in the column will be lost.
  - You are about to drop the column `masterId` on the `OtherService` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `OtherService` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `OtherService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `OtherService` table without a default value. This is not possible if the table is not empty.
  - Made the column `amount` on table `OtherService` required. This step will fail if there are existing NULL values in that column.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OtherServiceMaster";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_BookingToOtherService" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BookingToOtherService_A_fkey" FOREIGN KEY ("A") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BookingToOtherService_B_fkey" FOREIGN KEY ("B") REFERENCES "OtherService" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OtherService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT,
    CONSTRAINT "OtherService_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "OtherServiceCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OtherService" ("amount", "id") SELECT "amount", "id" FROM "OtherService";
DROP TABLE "OtherService";
ALTER TABLE "new_OtherService" RENAME TO "OtherService";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_BookingToOtherService_AB_unique" ON "_BookingToOtherService"("A", "B");

-- CreateIndex
CREATE INDEX "_BookingToOtherService_B_index" ON "_BookingToOtherService"("B");
